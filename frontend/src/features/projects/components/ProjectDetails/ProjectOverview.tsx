import { ArrowRight, CalendarDays } from "lucide-react";
import { Table } from "../../../../components/ui/Table/Table";
import { useGetProject, useGetProjectMembers } from "../../api/projects.api";
import { useGetProjectTasks } from "../../api/tasks.api";
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

// const initialsOf = (name: string) =>
//   name
//     .trim()
//     .split(/\s+/)
//     .slice(0, 2)
//     .map((w) => w[0]?.toUpperCase() ?? "")
//     .join("") || "?";

// const memberNameOf = (m: { user_id: { name: string } | string }): string =>
//   typeof m.user_id === "string" ? m.user_id : m.user_id.name;

const ProjectOverview = ({
  orgId,
  projectId,
  onOpenBoard,
}: {
  orgId: string;
  projectId: string;
  onOpenBoard: () => void;
}) => {
  const { data: projectRes, isLoading: isProjectLoading } = useGetProject(
    orgId,
    projectId,
  );
  const { data: tasksRes, isLoading: isTasksLoading } = useGetProjectTasks(
    orgId,
    projectId,
  );
  // const { data: membersRes } = useGetProjectMembers(orgId, projectId);

  if (isProjectLoading) return <p>Loading…</p>;
  const project = projectRes?.data;
  if (!project) return <p>Project not found.</p>;

  const tasks = tasksRes?.data ?? [];
  // const members = membersRes?.data ?? [];
  const doneCount = tasks.filter((t) => t.status === "DONE").length;
  const progress =
    tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  return (
    <>
      <div className="overview-grid">
        <section className="panel padded">
          <h2>Project overview</h2>
          <p>{project.project_description?.trim() || "No description yet."}</p>
          <div className="progress-label">
            <span>Overall progress</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <i className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="overview-meta">
            <span className="badge green">
              {doneCount} of {tasks.length} done
            </span>
            <span>
              <CalendarDays size={14} />
              Created {formatDate(project.createdAt)}
            </span>
            {/* <div className="avatar-stack">
              {members.slice(0, 6).map((m) => (
                <span
                  className="account-initials"
                  key={m._id}
                  title={memberNameOf(m)}
                >
                  {initialsOf(memberNameOf(m))}
                </span>
              ))}
              {members.length === 0 && (
                <span className="para-xs org-muted">No members yet</span>
              )}
            </div> */}
          </div>
        </section>

        <section className="panel padded">
          <h2>Tasks at a glance</h2>
          {STATUSES.map((status) => (
            <div className="overview-stat" key={status}>
              <span className={`badge status-${status.toLowerCase()}`}>
                {STATUS_LABEL[status]}
              </span>
              <strong>
                {tasks.filter((task) => task.status === status).length}
              </strong>
            </div>
          ))}
        </section>
      </div>

      <section className="panel">
        <div className="section-heading">
          <h2>
            Project tasks <span className="count-pill">{tasks.length}</span>
          </h2>
          <button className="text-button" onClick={onOpenBoard}>
            Open board
            <ArrowRight size={14} />
          </button>
        </div>
        <Table<TaskData>
          data={tasks.slice(0, 5)}
          columns={[
            { accessor: "task_name", label: "Task" },
            {
              accessor: "status",
              label: "Status",
              render: ({ row }) => (
                <span className={`badge status-${row.status.toLowerCase()}`}>
                  {STATUS_LABEL[row.status]}
                </span>
              ),
            },
            { accessor: "priority", label: "Priority" },
            { accessor: "type", label: "Type" },
          ]}
          rowKey="_id"
          isLoading={isTasksLoading}
          noDataMessage="No tasks yet. Create the first task to get started."
        />
      </section>
    </>
  );
};

export default ProjectOverview;
