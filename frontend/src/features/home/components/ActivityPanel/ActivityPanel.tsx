import { useMemo } from "react";
import { ArrowRight, Check, MessageSquare } from "lucide-react";
import { Button } from "../../../../components/ui/Button/Button";
import { ThreeDotMenu } from "../../../../components/ui/ThreeDotMenu/ThreeDotMenu";
import type { DashboardTask } from "../../data/home.dummy";
import {
  assigneeNameOf,
  creatorNameOf,
  timeAgoFor,
} from "../../utils/home.utils";
import { Avatar } from "../Avatar/Avatar";

interface ActivityPanelProps {
  tasks: DashboardTask[];
  onTaskPress: (task: DashboardTask) => void;
  onViewAll: () => void;
  onRefresh: () => void;
}

export function ActivityPanel({
  tasks,
  onTaskPress,
  onViewAll,
  onRefresh,
}: ActivityPanelProps) {
  const items = useMemo(
    () =>
      [...tasks]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 4),
    [tasks],
  );

  return (
    <section className="panel recent-activity">
      <div className="section-heading">
        <h2>Recent activity</h2>
        <ThreeDotMenu
          ariaLabel="Activity options"
          trigger={<span className="menu-dots" aria-hidden="true">⋮</span>}
          items={[
            {
              key: "view-all",
              label: "View all activity",
              icon: <ArrowRight size={14} />,
              onClick: onViewAll,
            },
            {
              key: "refresh",
              label: "Refresh",
              onClick: onRefresh,
            },
          ]}
        />
      </div>
      {items.length === 0 ? (
        <p className="empty-note">No activity yet.</p>
      ) : (
        items.map((task) => {
          const name = creatorNameOf(task);
          const assignee = assigneeNameOf(task);
          const action =
            task.status === "DONE"
              ? "completed"
              : assignee
                ? `assigned to ${assignee}`
                : "updated";
          return (
            <div className="activity-item" key={task._id}>
              <div className="activity-avatar">
                <Avatar name={name} size="sm" />
                <span className={task.status === "DONE" ? "green" : "indigo"}>
                  {task.status === "DONE" ? (
                    <Check size={8} />
                  ) : (
                    <MessageSquare size={8} />
                  )}
                </span>
              </div>
              <div>
                <p>
                  <strong>{name}</strong> <span>{action}</span>
                </p>
                <button type="button" onClick={() => onTaskPress(task)}>
                  {task.task_name}
                </button>
                <small>{timeAgoFor(task.updatedAt)}</small>
              </div>
            </div>
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
        View all activity
      </Button>
    </section>
  );
}

export default ActivityPanel;
