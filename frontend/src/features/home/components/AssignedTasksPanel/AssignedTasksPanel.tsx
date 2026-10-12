import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Circle } from "lucide-react";
import { Button } from "../../../../components/ui/Button/Button";
import { DropDown } from "../../../../components/ui/DropDown/DropDown";
import { SearchField } from "../../../../components/ui/SearchField/SearchField";
import { Table } from "../../../../components/ui/Table/Table";
import type { TableColumn } from "../../../../components/ui/Table/table.types";
import type {
  DashboardProject,
  DashboardTask,
} from "../../api/home.api";
import {
  assigneeIdOf,
  dueLabelFor,
  isOverdue,
  startOfToday,
} from "../../utils/home.utils";
import { StatusPill } from "../StatusPill/StatusPill";

type TasksTab = "Upcoming" | "Overdue" | "Completed";

interface AssignedTasksPanelProps {
  tasks: DashboardTask[];
  currentUserId: string | null;
  projects: DashboardProject[];
  onTaskPress: (task: DashboardTask) => void;
  onViewAll: () => void;
}

const TABS: TasksTab[] = ["Upcoming", "Overdue", "Completed"];

export function AssignedTasksPanel({
  tasks,
  currentUserId,
  projects,
  onTaskPress,
  onViewAll,
}: AssignedTasksPanelProps) {
  const [tab, setTab] = useState<TasksTab>("Upcoming");
  const [projectFilter, setProjectFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setPage(1);
  }, [tab, projectFilter, query]);

  const today = useMemo(() => startOfToday(), []);
  const myTasks = useMemo(
    () =>
      currentUserId
        ? tasks.filter((t) => assigneeIdOf(t) === currentUserId)
        : [],
    [tasks, currentUserId],
  );

  const upcoming = useMemo(
    () =>
      myTasks
        .filter((t) => t.status !== "DONE" && t.status !== "CANCELLED")
        .sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return (
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          );
        }),
    [myTasks],
  );
  const overdue = useMemo(
    () => myTasks.filter((t) => isOverdue(t, today)),
    [myTasks, today],
  );
  const completed = useMemo(
    () => myTasks.filter((t) => t.status === "DONE"),
    [myTasks],
  );

  const counts: Record<TasksTab, number> = {
    Upcoming: upcoming.length,
    Overdue: overdue.length,
    Completed: completed.length,
  };
  const base = tab === "Upcoming" ? upcoming : tab === "Overdue" ? overdue : completed;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.filter((t) => {
      const taskProjectId =
        typeof t.project_id === "string" ? t.project_id : t.project_id?._id;
      if (projectFilter !== "all" && taskProjectId !== projectFilter)
        return false;
      if (q && !t.task_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [base, projectFilter, query]);

  const columns = useMemo<TableColumn<DashboardTask>[]>(
    () => [
      {
        accessor: "task_name",
        label: "Task",
        render: ({ row }) => (
          <span className="task-cell">
            <Circle size={14} aria-hidden="true" />
            <span className="task-cell__title">{row.task_name}</span>
          </span>
        ),
      },
      {
        accessor: "projectName",
        label: "Project",
        render: ({ row }) => (
          <span className="muted-cell">{row.projectName ?? "—"}</span>
        ),
      },
      {
        accessor: "status",
        label: "Status",
        render: ({ row }) => <StatusPill status={row.status} />,
      },
      {
        accessor: "due_date",
        label: "Due",
        render: ({ row }) => (
          <span
            className={isOverdue(row, today) ? "red-text" : "muted-cell"}
          >
            {dueLabelFor(row.due_date, today)}
          </span>
        ),
      },
    ],
    [today],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = rows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  return (
    <section className="panel assigned-panel">
      <div className="section-heading">
        <h2>
          My assigned tasks <span className="count-pill">{myTasks.length}</span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-button"
          rightIcon={<ArrowRight size={14} />}
          onPress={onViewAll}
        >
          View all tasks
        </Button>
      </div>

      <div className="task-tabs" role="tablist" aria-label="My tasks">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {key}{" "}
            <span className={key === "Overdue" ? "red-count" : ""}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="assigned-filters">
        <DropDown
          options={[
            { label: "All projects", value: "all" },
            ...projects.map((p) => ({ label: p.project_name, value: p._id })),
          ]}
          value={projectFilter}
          onChange={setProjectFilter}
          ariaLabel="Filter tasks by project"
        />
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search my tasks…"
          aria-label="Search my tasks"
        />
      </div>

      <Table
        columns={columns}
        data={pagedRows}
        rowKey="_id"
        showPagination={rows.length > pageSize}
        pagination={{
          currentPage: safePage,
          totalPages,
          pageSize,
          onPageChange: setPage,
        }}
        onRowClick={onTaskPress}
        noDataMessage={
          tab === "Completed"
            ? "No completed tasks yet — keep going."
            : tab === "Overdue"
              ? "Nothing overdue. Nice work."
              : "No tasks assigned to you yet."
        }
      />
    </section>
  );
}

export default AssignedTasksPanel;
