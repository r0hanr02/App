import type { TaskPriority, TaskStatus, TaskType } from "../types";

export const TASK_STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
  "CANCELLED",
];

export const TASK_PRIORITIES: TaskPriority[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

export const TASK_TYPES: TaskType[] = [
  "Feature",
  "Bug",
  "Improvement",
  "Task",
  "Documentation",
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export const PAGE_LIMIT = 10;
export const BOARD_LIMIT = 100;
export const ALL_FILTER = "";
