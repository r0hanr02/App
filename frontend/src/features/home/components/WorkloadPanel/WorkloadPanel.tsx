import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../../../../components/ui/Button/Button";
import type { DashboardTask, OrgMember } from "../../data/home.dummy";
import { assigneeIdOf, memberIdOf, memberNameOf } from "../../utils/home.utils";
import { Avatar } from "../Avatar/Avatar";

interface WorkloadPanelProps {
  readonly tasks: DashboardTask[];
  readonly members: OrgMember[];
  readonly onViewTeam: () => void;
}

const BAR_TONES = ["indigo", "pink", "teal", "amber"];

export function WorkloadPanel({
  tasks,
  members,
  onViewTeam,
}: WorkloadPanelProps) {
  const rows = useMemo(() => {
    const countByUser = new Map<string, number>();
    for (const task of tasks) {
      if (task.status === "DONE" || task.status === "CANCELLED") continue;
      const id = assigneeIdOf(task);
      if (id) countByUser.set(id, (countByUser.get(id) ?? 0) + 1);
    }
    return members.slice(0, 4).map((member) => {
      const id = memberIdOf(member);
      return {
        member,
        name: memberNameOf(member),
        count: id ? (countByUser.get(id) ?? 0) : 0,
      };
    });
  }, [tasks, members]);

  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <section className="panel workload">
      <div className="section-heading">
        <h2>Team workload</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-button"
          rightIcon={<ArrowRight size={13} />}
          onPress={onViewTeam}
        >
          View team
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="empty-note">No team members yet.</p>
      ) : (
        rows.map(({ member, name, count }, index) => (
          <div className="workload-row" key={member._id}>
            <Avatar name={name} size="sm" />
            <span>{name}</span>
            <div className="workload-track">
              <i
                className={BAR_TONES[index % BAR_TONES.length]}
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </div>
            <strong>{count}</strong>
          </div>
        ))
      )}
      <div className="workload-key">
        <i />
        Active tasks assigned{" "}
      </div>
    </section>
  );
}

export default WorkloadPanel;
