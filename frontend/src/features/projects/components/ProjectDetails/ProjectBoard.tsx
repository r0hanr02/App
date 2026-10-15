import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ListTodo,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "../../../../components/ui/Button/Button";
import { TextField } from "../../../../components/ui/TextField/TextField";
import DropDown from "../../../../components/ui/DropDown/DropDown";
import { Table } from "../../../../components/ui/Table/Table";
import { toast } from "../../../../components/ui/Toast/toast.api";
import {
  useDeleteTask,
  useGetProjectTasks,
  useUpdateTask,
} from "../../api/tasks.api";
import type { TaskData, TaskStatus } from "../../types";

const STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "CANCELLED",
];

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

const ALL_STATUSES = "All statuses";
const PAGE_SIZE = 10;

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
};

const assigneeNameOf = (task: TaskData) => {
  if (!task.assignee_id) return "Unassigned";
  if (typeof task.assignee_id === "string") return "Assigned";
  return task.assignee_id.name ?? "Assigned";
};

const ProjectBoard = ({
  orgId,
  projectId,
  canManage,
  view,
  onViewChange,
}: {
  orgId: string;
  projectId: string;
  canManage: boolean;
  view: "Board" | "List";
  onViewChange: (view: "Board" | "List") => void;
}) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(ALL_STATUSES);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<TaskData[]>([]);

  const { data: tasksRes, isLoading } = useGetProjectTasks(orgId, projectId);
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(
    orgId,
    projectId,
  );
  const { mutate: deleteTask } = useDeleteTask(orgId, projectId);

  const tasks = useMemo(() => tasksRes?.data ?? [], [tasksRes]);

  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = tasks.filter((task) => {
      const matchesQuery =
        !q ||
        task.task_name.toLowerCase().includes(q) ||
        (task.description ?? "").toLowerCase().includes(q);
      const matchesStatus = filter === ALL_STATUSES || task.status === filter;
      return matchesQuery && matchesStatus;
    });
    return [...filtered].sort((a, b) => {
      const cmp = a.task_name.localeCompare(b.task_name);
      return sortAsc ? cmp : -cmp;
    });
  }, [tasks, query, filter, sortAsc]);

  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [query, filter]);

  const totalPages = Math.max(1, Math.ceil(visibleTasks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedTasks = visibleTasks.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTask(
      { taskId, status },
      { onSuccess: (res) => toast.success(res.message) },
    );
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId, {
      onSuccess: (res) => toast.success(res.message ?? "Task deleted"),
    });
    setSelected((prev) => prev.filter((r) => r._id !== taskId));
  };

  const handleBulkComplete = () => {
    if (selected.length === 0) return;
    let completed = 0;
    const done = () => {
      completed += 1;
      if (completed === selected.length) {
        setSelected([]);
        toast.success("Selected tasks marked as done");
      }
    };
    selected.forEach((row) => {
      if (row.status === "DONE") return done();
      updateTask({ taskId: row._id, status: "DONE" }, { onSuccess: done });
    });
  };

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-search">
          <TextField
            placeholder="Search tasks..."
            aria-label="Search tasks"
            value={query}
            onChange={setQuery}
            leftIcon={<Search size={15} />}
          />
        </div>
        <DropDown
          ariaLabel="Filter status"
          value={filter}
          onChange={setFilter}
          options={[
            { label: "All statuses", value: ALL_STATUSES },
            ...STATUSES.map((s) => ({ label: STATUS_LABEL[s], value: s })),
          ]}
        />
        <Button
          variant="secondary"
          aria-label={sortAsc ? "Sort Z to A" : "Sort A to Z"}
          leftIcon={sortAsc ? <ArrowDownAZ size={15} /> : <ArrowUpAZ size={15} />}
          onPress={() => setSortAsc((v) => !v)}
        >
          Sort {sortAsc ? "A–Z" : "Z–A"}
        </Button>
        <div className="view-switch">
          {(["List", "Board"] as const).map((item) => (
            <button
              className={view === item ? "active" : ""}
              onClick={() => onViewChange(item)}
              key={item}
            >
              {item === "List" ? (
                <ListTodo size={15} />
              ) : (
                <LayoutDashboard size={15} />
              )}{" "}
              {item}
            </button>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="bulk-actions">
          {selected.length} selected
          <Button
            variant="secondary"
            size="sm"
            isDisabled={isUpdating}
            leftIcon={<CheckCheck size={14} />}
            onPress={handleBulkComplete}
          >
            Mark completed
          </Button>
          <Button variant="ghost" size="sm" onPress={() => setSelected([])}>
            Clear
          </Button>
        </div>
      )}

      {view === "Board" ? (
        <div className="kanban">
          {STATUSES.map((status) => {
            const cards = visibleTasks.filter((t) => t.status === status);
            return (
              <section className="panel kanban-col" key={status}>
                <div className="section-heading">
                  <h2>
                    {STATUS_LABEL[status]}{" "}
                    <span className="count-pill">{cards.length}</span>
                  </h2>
                </div>
                <div className="kanban-cards">
                  {cards.map((task) => (
                    <article className="kanban-card" key={task._id}>
                      <strong>{task.task_name}</strong>
                      {task.description ? (
                        <p>{task.description.slice(0, 120)}</p>
                      ) : null}
                      <div className="kanban-meta">
                        <span className="badge">{task.priority}</span>
                        <span className="badge">{task.type}</span>
                      </div>
                      <div className="kanban-meta">
                        <span className="para-xs org-muted">
                          {assigneeNameOf(task)} · {formatDate(task.due_date)}
                        </span>
                      </div>
                      {canManage && (
                        <div className="kanban-actions">
                          <DropDown
                            ariaLabel={`Move ${task.task_name} to status`}
                            value={task.status}
                            onChange={(v) =>
                              handleStatusChange(task._id, v as TaskStatus)
                            }
                            options={STATUSES.map((s) => ({
                              label: STATUS_LABEL[s],
                              value: s,
                            }))}
                          />
                        </div>
                      )}
                    </article>
                  ))}
                  {cards.length === 0 && (
                    <p className="para-xs org-muted kanban-empty">No tasks</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="panel">
          <Table<TaskData>
            data={pagedTasks}
            columns={[
              {
                accessor: "task_name",
                label: "Task",
                render: ({ row }) => (
                  <span>
                    <strong>{row.task_name}</strong>
                    {row.description ? (
                      <small className="cell-sub">
                        {row.description.slice(0, 80)}
                      </small>
                    ) : null}
                  </span>
                ),
              },
              {
                accessor: "status",
                label: "Status",
                render: ({ row }) => (
                  <span
                    className={`badge status-${row.status.toLowerCase()}`}
                  >
                    {STATUS_LABEL[row.status]}
                  </span>
                ),
              },
              { accessor: "priority", label: "Priority" },
              { accessor: "type", label: "Type" },
              {
                accessor: "assignee_id",
                label: "Assignee",
                render: ({ row }) => <span>{assigneeNameOf(row)}</span>,
              },
              {
                accessor: "due_date",
                label: "Due",
                render: ({ row }) => <span>{formatDate(row.due_date)}</span>,
              },
              ...(canManage
                ? [
                    {
                      accessor: "_id",
                      label: "Actions",
                      render: ({ row }: { row: TaskData }) => (
                        <span
                          className="row-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropDown
                            ariaLabel={`Change status for ${row.task_name}`}
                            value={row.status}
                            onChange={(value) =>
                              handleStatusChange(row._id, value as TaskStatus)
                            }
                            options={STATUSES.map((s) => ({
                              label: STATUS_LABEL[s],
                              value: s,
                            }))}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Delete ${row.task_name}`}
                            onPress={() => handleDelete(row._id)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </span>
                      ),
                    },
                  ]
                : []),
            ]}
            rowKey="_id"
            isLoading={isLoading}
            noDataMessage={
              query || filter !== ALL_STATUSES
                ? "No tasks match your search."
                : "No tasks yet. Create the first task to get started."
            }
            rowSelection={canManage}
            showRowSelection={
              canManage
                ? { selectedRows: selected, onSelectionChange: setSelected }
                : undefined
            }
          />
          <div className="pagination">
            <span>
              Showing {pagedTasks.length} of {visibleTasks.length} tasks
            </span>
            <Button
              variant="secondary"
              size="sm"
              aria-label="Previous page"
              isDisabled={safePage <= 1}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={15} />
            </Button>
            <span className="page-current">{safePage}</span>
            <Button
              variant="secondary"
              size="sm"
              aria-label="Next page"
              isDisabled={safePage >= totalPages}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </section>
      )}
    </>
  );
};

export default ProjectBoard;
