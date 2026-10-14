import { ArrowRight, Folder, Shield, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getRoutePath } from "../../../factories/RouteFactory";

interface Props {
  memberCount: number;
  projectCount: number;
  role: string;
  orgSlug: string | null;
}

function formatRole(role: string): string {
  if (!role) return "—";
  const lower = role.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

const OrganizationMetrics = ({
  memberCount,
  projectCount,
  role,
  orgSlug,
}: Props) => {
  const items = [
    {
      icon: Users,
      label: "Team members",
      value: String(memberCount),
      routeKey: "USERS" as const,
    },
    {
      icon: Folder,
      label: "Projects",
      value: String(projectCount),
      routeKey: "PROJECTS" as const,
    },
    {
      icon: Shield,
      label: "Your role",
      value: formatRole(role),
      routeKey: "SETTINGS" as const,
    },
  ];

  return (
    <div className="account-metrics">
      {items.map((item) => (
        <Link
          key={item.label}
          to={(orgSlug ? getRoutePath(item.routeKey) : item.routeKey) as never}
          params={orgSlug ? ({ orgSlug } as never) : undefined}
          className="panel account-metric"
        >
          <item.icon size={18} />
          <span className="para-xs">
            {item.label}
            <strong className="title-sm">{item.value}</strong>
          </span>
          <ArrowRight size={15} />
        </Link>
      ))}
    </div>
  );
};

export default OrganizationMetrics;
