import { TASK_STATUS_LABELS } from "../../constants/tasks.constants";
import type { TaskPriority, TaskStatus } from "../../types";
import "./style.scss";

export const TaskStatusBadge = ({ status }: { status: TaskStatus }) => (
  <span className={`task-status task-status--${status.toLowerCase()}`}>
    {TASK_STATUS_LABELS[status]}
  </span>
);

export const TaskPriorityBadge = ({
  priority,
}: {
  priority: TaskPriority;
}) => (
  <span className={`task-priority task-priority--${priority.toLowerCase()}`}>
    {priority}
  </span>
);
