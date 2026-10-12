import type { DashboardTaskStatus } from "../../api/home.api";

export const STATUS_META: Record<
  DashboardTaskStatus,
  { label: string; tone: string }
> = {
  TODO: { label: "Todo", tone: "slate" },
  IN_PROGRESS: { label: "In Progress", tone: "indigo" },
  IN_REVIEW: { label: "In Review", tone: "amber" },
  DONE: { label: "Done", tone: "green" },
  CANCELLED: { label: "Cancelled", tone: "grey" },
};

export function StatusPill({ status }: { status: DashboardTaskStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.TODO;
  return <span className={`status-pill ${meta.tone}`}>{meta.label}</span>;
}

export default StatusPill;
