import type { LucideIcon } from "lucide-react";
import { Button } from "../../../../components/ui/Button/Button";

export type StatTone = "indigo" | "amber" | "green" | "red";

interface StatCardProps {
  title: string;
  value: string;
  detail: string;
  detailDanger?: boolean;
  icon: LucideIcon;
  tone: StatTone;
  onPress: () => void;
}

export function StatCard({
  title,
  value,
  detail,
  detailDanger = false,
  icon: Icon,
  tone,
  onPress,
}: StatCardProps) {
  return (
    <Button
      variant="ghost"
      className="stat-card"
      onPress={onPress}
      aria-label={`${title}: ${value}`}
    >
      <span className="stat-top">
        <span>{title}</span>
        <span className={`stat-icon ${tone}`}>
          <Icon size={17} />
        </span>
      </span>
      <span className="stat-value">{value}</span>
      <span className={`stat-detail ${detailDanger ? "red-text" : ""}`}>
        {detail}
      </span>
    </Button>
  );
}

export default StatCard;
