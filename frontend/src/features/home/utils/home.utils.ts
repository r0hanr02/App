import type { DashboardTask, OrgMember } from "../data/home.dummy";

/* Pure dashboard helpers — no React, no side effects. */

export function assigneeIdOf(task: DashboardTask): string | null {
  if (!task.assignee_id) return null;
  if (typeof task.assignee_id === "string") return task.assignee_id;
  return task.assignee_id._id ?? null;
}

export function creatorNameOf(task: DashboardTask): string {
  if (!task.creator_id) return "Someone";
  if (typeof task.creator_id === "string") return "Someone";
  return task.creator_id.name || "Someone";
}

export function assigneeNameOf(task: DashboardTask): string | null {
  if (!task.assignee_id) return null;
  if (typeof task.assignee_id === "string") return null;
  return task.assignee_id.name ?? null;
}

export function memberIdOf(member: OrgMember): string | null {
  if (typeof member.user_id === "string") return member.user_id;
  return member.user_id?._id ?? null;
}

export function memberNameOf(member: OrgMember): string {
  if (typeof member.user_id === "string") return "Team member";
  return member.user_id?.name || "Team member";
}

export function memberEmailOf(member: OrgMember): string {
  if (typeof member.user_id === "string") return "";
  return member.user_id?.email || "";
}

export function projectIdOf(task: DashboardTask): string {
  if (typeof task.project_id === "string") return task.project_id;
  return task.project_id?._id ?? "";
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isOverdue(task: DashboardTask, today: Date): boolean {
  if (task.status === "DONE" || task.status === "CANCELLED") return false;
  if (!task.due_date) return false;
  return new Date(task.due_date).getTime() < today.getTime();
}

export function greetingFor(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function eyebrowFor(date: Date): string {
  return date
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export function dueLabelFor(due: string | null, today: Date): string {
  if (!due) return "No due date";
  const dueDate = new Date(due);
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(
    (new Date(dueDate.toDateString()).getTime() -
      new Date(today.toDateString()).getTime()) /
      dayMs,
  );
  if (diffDays < 0)
    return `Overdue · ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return dueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function timeAgoFor(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export interface ActivityPoint {
  key: string;
  day: string;
  created: number;
  completed: number;
}

export function buildActivity(tasks: DashboardTask[]): ActivityPoint[] {
  const days: ActivityPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toDateString(),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      created: 0,
      completed: 0,
    });
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const task of tasks) {
    const createdBucket = byKey.get(new Date(task.createdAt).toDateString());
    if (createdBucket) createdBucket.created += 1;
    if (task.status === "DONE") {
      const doneBucket = byKey.get(new Date(task.updatedAt).toDateString());
      if (doneBucket) doneBucket.completed += 1;
    }
  }
  return days;
}

/** Simple SVG line path through points (straight segments, round joins). */
export function linePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
}
