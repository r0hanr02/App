import type { OrgMember } from "../../settings/types";
import type { TaskData } from "../types";

export const formatTaskDate = (iso?: string | null) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const isTaskOverdue = (task: TaskData) => {
  if (!task.due_date || task.status === "DONE" || task.status === "CANCELLED") {
    return false;
  }
  const due = new Date(task.due_date).getTime();
  if (Number.isNaN(due)) return false;
  return due < Date.now();
};

export const assigneeIdOf = (task: TaskData): string => {
  if (!task.assignee_id) return "";
  if (typeof task.assignee_id === "string") return task.assignee_id;
  return task.assignee_id._id;
};

export const assigneeNameOf = (task: TaskData): string => {
  if (!task.assignee_id) return "Unassigned";
  if (typeof task.assignee_id === "string") return "Assigned";
  return task.assignee_id.name || "Assigned";
};

export const creatorNameOf = (task: TaskData): string => {
  if (!task.creator_id) return "Unknown";
  if (typeof task.creator_id === "string") return "Unknown";
  return task.creator_id.name || "Unknown";
};

export const memberIdOf = (member: OrgMember): string =>
  typeof member.user_id === "string" ? member.user_id : member.user_id._id;

export const memberNameOf = (member: OrgMember): string =>
  typeof member.user_id === "string"
    ? member.user_id
    : (member.user_id.name ?? "Unknown");

export const memberEmailOf = (member: OrgMember): string =>
  typeof member.user_id === "string" ? "" : (member.user_id.email ?? "");

export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "?";

export const toDateInputValue = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const toDueDateISO = (dateValue: string): string | null => {
  if (!dateValue) return null;
  const parsed = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};
