import { useMemo } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "../../../../components/ui/Button/Button";
import type { DashboardTask } from "../../data/home.dummy";
import { dueLabelFor, isOverdue } from "../../utils/home.utils";

interface DeadlinesPanelProps {
  tasks: DashboardTask[];
  today: Date;
  onTaskPress: (task: DashboardTask) => void;
  onViewAll: () => void;
}

export function DeadlinesPanel({
  tasks,
  today,
  onTaskPress,
  onViewAll,
}: Readonly<DeadlinesPanelProps>) {
  const deadlines = useMemo(
    () =>
      tasks
        .filter(
          (t) => t.due_date && t.status !== "DONE" && t.status !== "CANCELLED",
        )
        .sort(
          (a, b) =>
            new Date(a.due_date as string).getTime() -
            new Date(b.due_date as string).getTime(),
        )
        .slice(0, 3),
    [tasks],
  );

  return (
    <section className="panel deadlines">
      <div className="section-heading">
        <h2>Upcoming deadlines</h2>
        <CalendarDays size={16} />
      </div>
      {deadlines.length === 0 ? (
        <p className="empty-note">No upcoming deadlines.</p>
      ) : (
        deadlines.map((task) => {
          const due = task.due_date ? new Date(task.due_date) : null;
          const overdue = isOverdue(task, today);
          const soon =
            !overdue &&
            due !== null &&
            due.getTime() - today.getTime() < 3 * 24 * 60 * 60 * 1000;

          let deadlineDateClass = "indigo";
          if (overdue) {
            deadlineDateClass = "red";
          } else if (soon) {
            deadlineDateClass = "amber";
          }

          return (
            <button
              type="button"
              className="deadline-row"
              key={task._id}
              onClick={() => onTaskPress(task)}
            >
              <span className={`deadline-date ${deadlineDateClass}`}>
                <small>
                  {due
                    ? due
                        .toLocaleDateString("en-US", { month: "short" })
                        .toUpperCase()
                    : "—"}
                </small>
                <strong>{due ? due.getDate() : "·"}</strong>
              </span>
              <span className="deadline-meta">
                <strong>{task.task_name}</strong>
                <small>{task.projectName ?? "Task"}</small>
              </span>
              <span className={overdue ? "red-text" : ""}>
                {dueLabelFor(task.due_date, today)}
              </span>
            </button>
          );
        })
      )}
      <Button
        variant="ghost"
        fullWidth
        className="panel-footer-button"
        rightIcon={<ArrowRight size={13} />}
        onPress={onViewAll}
      >
        View all deadlines
      </Button>
    </section>
  );
}

export default DeadlinesPanel;
