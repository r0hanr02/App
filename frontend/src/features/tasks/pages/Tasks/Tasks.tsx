import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  EllipsisVertical,
  Eye,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "../../../../components/ui/Button/Button";
import DropDown from "../../../../components/ui/DropDown/DropDown";
import { Modal } from "../../../../components/ui/Modal/Modal";
import PageHeading from "../../../../components/ui/PageHeading/PageHeading";
import { Table } from "../../../../components/ui/Table/Table";
import { TextField } from "../../../../components/ui/TextField/TextField";
import ThreeDotMenu from "../../../../components/ui/ThreeDotMenu/ThreeDotMenu";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { getRoutePath } from "../../../../factories/RouteFactory";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { useGetAllProjects } from "../../../projects/api/projects.api";
import { useOrganizationMembers } from "../../../settings/api/settings.api";
import { useDeleteTask, useGetTasks, useUpdateTask } from "../../api/tasks.api";
import TaskDetailsModal from "../../components/TaskDetailsModal/TaskDetailsModal";
import TaskFormModal from "../../components/TaskFormModal/TaskFormModal";
import {
  TaskPriorityBadge,
  TaskStatusBadge,
} from "../../components/TaskBadges/TaskBadges";
import {
  BOARD_LIMIT,
  PAGE_LIMIT,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_TYPES,
} from "../../constants/tasks.constants";
import type {
  TaskData,
  TaskPriority,
  TaskQuery,
  TaskStatus,
  TaskType,
  TaskView,
} from "../../types";
import {
  assigneeNameOf,
  formatTaskDate,
  isTaskOverdue,
  memberIdOf,
  memberNameOf,
} from "../../utils/tasks.utils";
import "./style.scss";

const PROJECT_OPTIONS_LIMIT = 100;

const Tasks = () => {
  const navigate = useNavigate();
  const {
    activeOrgId,
    activeOrg,
    activeOrgSlug,
    isLoading: isOrgLoading,
  } = useActiveOrg();

  const canManage = activeOrg?.role === "OWNER" || activeOrg?.role === "ADMIN";

  const { data: projectsRes, isPending: isProjectsPending } =
    useGetAllProjects(activeOrgId, PROJECT_OPTIONS_LIMIT);
  const projects = useMemo(() => projectsRes?.data ?? [], [projectsRes]);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [type, setType] = useState<TaskType | "">("");
  const [assignee, setAssignee] = useState("");
  const [view, setView] = useState<TaskView>("List");
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [detailsTaskId, setDetailsTaskId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskData | null>(null);

  useEffect(() => {
    if (projects.length === 0) {
      setProjectId(null);
      return;
    }
    if (!projectId || !projects.some((project) => project._id === projectId)) {
      setProjectId(projects[0]._id);
    }
  }, [projects, projectId]);

  useEffect(() => {
    setPage(1);
  }, [projectId, deferredSearch, status, priority, type, assignee, view]);

  useEffect(() => {
    setDetailsTaskId(null);
    setEditingTask(null);
    setIsFormOpen(false);
    setDeleteTarget(null);
  }, [projectId]);

  const { data: members = [] } = useOrganizationMembers(activeOrgId);

  const memberOptions = useMemo(
    () =>
      members.map((member) => ({
        label: memberNameOf(member),
        value: memberIdOf(member),
      })),
    [members],
  );

  const limit = view === "Board" ? BOARD_LIMIT : PAGE_LIMIT;

  const taskQuery = useMemo<TaskQuery>(
    () => ({
      status: status || undefined,
      priority: priority || undefined,
      type: type || undefined,
      assignee_id: assignee || undefined,
      search: deferredSearch.trim() || undefined,
      page: view === "Board" ? 1 : page,
      limit,
    }),
    [status, priority, type, assignee, deferredSearch, page, limit, view],
  );

  const {
    data: tasksRes,
    isPending: isTasksPending,
    isError,
    error,
  } = useGetTasks(activeOrgId, projectId, taskQuery);

  const tasks = tasksRes?.data ?? [];
  const pagination = tasksRes?.pagination;

  useEffect(() => {
    if (
      pagination &&
      pagination.totalPages > 0 &&
      page > pagination.totalPages
    ) {
      setPage(pagination.totalPages);
    }
  }, [pagination, page]);

  const updateTask = useUpdateTask(activeOrgId, projectId);
  const deleteTask = useDeleteTask(activeOrgId, projectId);

  const hasFilters = Boolean(
    search.trim() || status || priority || type || assignee,
  );

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setType("");
    setAssignee("");
  };

  const openCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const openEdit = (task: TaskData) => {
    setEditingTask(task);
    setIsFormOpen(true);
    setDetailsTaskId(null);
  };

  const handleStatusChange = (task: TaskData, nextStatus: TaskStatus) => {
    if (task.status === nextStatus) return;
    updateTask.mutate(
      { taskId: task._id, status: nextStatus },
      { onSuccess: (res) => toast.success(res.message) },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteTask.mutate(deleteTarget._id, {
      onSuccess: (res) => {
        toast.success(res.message ?? "Task deleted");
        setDeleteTarget(null);
        setDetailsTaskId(null);
      },
    });
  };

  const goToProjects = () => {
    navigate({
      to: getRoutePath("PROJECTS") as never,
      params: activeOrgSlug
        ? ({ orgSlug: activeOrgSlug } as never)
        : undefined,
    }).catch(() => {});
  };

  return (
    <div className="tasks-page">
      <PageHeading
        topPara="Workspace tasks overview"
        title="Tasks"
        subtitle="Every task in one place. Search, filter, and move work forward."
        action={canManage && projectId ? "Create Task" : undefined}
        onAction={canManage && projectId ? openCreate : undefined}
      />

      {!activeOrgId && (
        <section className="panel tasks-empty">
          <h2>{isOrgLoading ? "Loading workspace…" : "No workspace selected"}</h2>
          <p className="para-sm org-muted">
            Pick a workspace to view its tasks.
          </p>
        </section>
      )}

      {activeOrgId && isProjectsPending && (
        <section className="panel tasks-empty">
          <h2>Loading projects…</h2>
          <p className="para-sm org-muted">
            Fetching projects for this workspace.
          </p>
        </section>
      )}

      {activeOrgId && !isProjectsPending && projects.length === 0 && (
        <section className="panel tasks-empty">
          <Inbox size={28} strokeWidth={1.5} aria-hidden="true" />
          <h2>No projects yet</h2>
          <p className="para-sm org-muted">
            Tasks live inside projects. Create a project first to start adding
            tasks.
          </p>
          {canManage && <Button onPress={goToProjects}>Go to projects</Button>}
        </section>
      )}

      {activeOrgId && projectId && (
        <>
          <div className="toolbar">
            <DropDown
              className="project-picker"
              ariaLabel="Select project"
              value={projectId}
              onChange={setProjectId}
              placeholder="Select project"
              options={projects.map((project) => ({
                label: project.project_name,
                value: project._id,
              }))}
            />
            <div className="toolbar-search">
              <TextField
                placeholder="Search tasks..."
                aria-label="Search tasks"
                value={search}
                onChange={setSearch}
                leftIcon={<Search size={15} />}
              />
            </div>
            <DropDown
              ariaLabel="Filter by status"
              value={status}
              onChange={(value) => setStatus(value as TaskStatus | "")}
              options={[
                { label: "All statuses", value: "" },
                ...TASK_STATUSES.map((item) => ({
                  label: TASK_STATUS_LABELS[item],
                  value: item,
                })),
              ]}
            />
            <DropDown
              ariaLabel="Filter by priority"
              value={priority}
              onChange={(value) => setPriority(value as TaskPriority | "")}
              options={[
                { label: "All priorities", value: "" },
                ...TASK_PRIORITIES.map((item) => ({
                  label: item,
                  value: item,
                })),
              ]}
            />
            <DropDown
              ariaLabel="Filter by type"
              value={type}
              onChange={(value) => setType(value as TaskType | "")}
              options={[
                { label: "All types", value: "" },
                ...TASK_TYPES.map((item) => ({ label: item, value: item })),
              ]}
            />
            <DropDown
              ariaLabel="Filter by assignee"
              value={assignee}
              onChange={setAssignee}
              options={[
                { label: "All assignees", value: "" },
                ...memberOptions,
              ]}
            />
            <div className="view-switch">
              {(["List", "Board"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={view === item ? "active" : ""}
                  onClick={() => setView(item)}
                >
                  {item === "List" ? (
                    <ListTodo size={15} />
                  ) : (
                    <LayoutDashboard size={15} />
                  )}
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="tasks-meta">
            <span>
              {pagination
                ? `${pagination.totalRecords} task${
                    pagination.totalRecords === 1 ? "" : "s"
                  }`
                : "—"}
            </span>
            {hasFilters && (
              <button
                type="button"
                className="text-button"
                onClick={resetFilters}
              >
                Clear filters
              </button>
            )}
          </div>

          {isError ? (
            <section className="panel tasks-empty">
              <h2>Unable to load tasks</h2>
              <p className="para-sm org-muted">
                {error?.message ?? "Please try again in a moment."}
              </p>
            </section>
          ) : view === "Board" ? (
            <>
              {isTasksPending ? (
                <div className="tasks-loading">Loading tasks…</div>
              ) : (
                <div className="kanban">
                  {TASK_STATUSES.map((statusItem) => {
                    const columnTasks = tasks.filter(
                      (task) => task.status === statusItem,
                    );
                    return (
                      <section className="panel kanban-col" key={statusItem}>
                        <div className="section-heading">
                          <h2>
                            {TASK_STATUS_LABELS[statusItem]}{" "}
                            <span className="count-pill">
                              {columnTasks.length}
                            </span>
                          </h2>
                        </div>
                        <div className="kanban-cards">
                          {columnTasks.map((task) => (
                            <article
                              className="kanban-card"
                              key={task._id}
                              onClick={() => setDetailsTaskId(task._id)}
                            >
                              <strong>{task.task_name}</strong>
                              {task.description ? (
                                <p>{task.description.slice(0, 120)}</p>
                              ) : null}
                              <div className="kanban-meta">
                                <TaskPriorityBadge priority={task.priority} />
                                <span className="task-type">{task.type}</span>
                              </div>
                              <div className="kanban-meta">
                                <span className="para-xs org-muted">
                                  {assigneeNameOf(task)} ·{" "}
                                  {formatTaskDate(task.due_date)}
                                </span>
                              </div>
                              {canManage && (
                                <div
                                  className="kanban-actions"
                                  onClick={(event) =>
                                    event.stopPropagation()
                                  }
                                >
                                  <DropDown
                                    ariaLabel={`Move ${task.task_name} to status`}
                                    value={task.status}
                                    disabled={updateTask.isPending}
                                    onChange={(value) =>
                                      handleStatusChange(
                                        task,
                                        value as TaskStatus,
                                      )
                                    }
                                    options={TASK_STATUSES.map((item) => ({
                                      label: TASK_STATUS_LABELS[item],
                                      value: item,
                                    }))}
                                  />
                                </div>
                              )}
                            </article>
                          ))}
                          {columnTasks.length === 0 && (
                            <p className="para-xs org-muted kanban-empty">
                              No tasks
                            </p>
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
              {pagination && pagination.totalRecords > tasks.length && (
                <p className="para-xs org-muted tasks-board-note">
                  Showing the first {tasks.length} of {pagination.totalRecords}{" "}
                  matching tasks. Narrow the filters to see the rest.
                </p>
              )}
            </>
          ) : (
            <section className="panel">
              <Table<TaskData>
                data={tasks}
                rowKey="_id"
                isLoading={isTasksPending}
                onRowClick={(task) => setDetailsTaskId(task._id)}
                noDataMessage={
                  hasFilters
                    ? "No tasks match your filters."
                    : "No tasks yet. Create the first task to get started."
                }
                pagination={{
                  currentPage: pagination?.currentPage ?? 1,
                  totalPages: Math.max(1, pagination?.totalPages ?? 1),
                  pageSize: pagination?.pageLimit ?? limit,
                  onPageChange: setPage,
                }}
                showPagination={
                  view === "List" && (pagination?.totalPages ?? 0) > 1
                }
                columns={[
                  {
                    accessor: "task_name",
                    label: "Task",
                    render: ({ row }) => (
                      <span>
                        <strong>{row.task_name}</strong>
                        {row.description ? (
                          <small className="cell-sub">
                            {row.description.slice(0, 90)}
                          </small>
                        ) : null}
                      </span>
                    ),
                  },
                  {
                    accessor: "status",
                    label: "Status",
                    render: ({ row }) => (
                      <TaskStatusBadge status={row.status} />
                    ),
                  },
                  {
                    accessor: "priority",
                    label: "Priority",
                    render: ({ row }) => (
                      <TaskPriorityBadge priority={row.priority} />
                    ),
                  },
                  { accessor: "type", label: "Type" },
                  {
                    accessor: "assignee_id",
                    label: "Assignee",
                    render: ({ row }) => <span>{assigneeNameOf(row)}</span>,
                  },
                  {
                    accessor: "due_date",
                    label: "Due",
                    render: ({ row }) => (
                      <span
                        className={
                          isTaskOverdue(row)
                            ? "due-date is-overdue"
                            : "due-date"
                        }
                      >
                        {formatTaskDate(row.due_date)}
                      </span>
                    ),
                  },
                  {
                    accessor: "_id",
                    label: "Actions",
                    colCenter: true,
                    render: ({ row }) => (
                      <span className="row-menu">
                        <ThreeDotMenu
                          ariaLabel={`Actions for ${row.task_name}`}
                          trigger={<EllipsisVertical size={16} />}
                          items={[
                            {
                              key: "view",
                              label: "View details",
                              icon: <Eye size={15} />,
                              onClick: () => setDetailsTaskId(row._id),
                            },
                            ...(canManage
                              ? [
                                  {
                                    key: "edit",
                                    label: "Edit task",
                                    icon: <Pencil size={15} />,
                                    onClick: () => openEdit(row),
                                  },
                                  {
                                    key: "delete",
                                    label: "Delete task",
                                    icon: <Trash2 size={15} />,
                                    danger: true,
                                    onClick: () => setDeleteTarget(row),
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </span>
                    ),
                  },
                ]}
              />
            </section>
          )}
        </>
      )}

      {canManage && activeOrgId && projectId && isFormOpen && (
        <TaskFormModal
          key={editingTask?._id ?? "new-task"}
          orgId={activeOrgId}
          projectId={projectId}
          task={editingTask}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
        />
      )}

      {activeOrgId && projectId && detailsTaskId && (
        <TaskDetailsModal
          key={detailsTaskId}
          orgId={activeOrgId}
          projectId={projectId}
          taskId={detailsTaskId}
          canManage={canManage}
          onClose={() => setDetailsTaskId(null)}
          onEdit={openEdit}
          onDelete={(task) => {
            setDetailsTaskId(null);
            setDeleteTarget(task);
          }}
        />
      )}

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        type="delete"
        header={{
          title: "Delete task",
          description: "This action cannot be undone.",
        }}
        footer={{
          dismiss: {
            text: "Cancel",
            onPress: () => setDeleteTarget(null),
          },
          submit: {
            text: "Delete",
            variant: "danger",
            loading: deleteTask.isPending,
            onPress: handleDelete,
          },
        }}
      >
        <p className="para-sm">
          Are you sure you want to delete{" "}
          <strong>{deleteTarget?.task_name}</strong>? The task will be removed
          from this project.
        </p>
      </Modal>
    </div>
  );
};

export default Tasks;
