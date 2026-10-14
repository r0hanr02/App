import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "../../../components/ui/Button/Button";
import { getRoutePath } from "../../../factories/RouteFactory";
import type { OrgMember } from "../api/organization.api";

interface Props {
  members: OrgMember[];
  canInvite: boolean;
  orgSlug: string | null;
  onInvite: () => void;
}

const nameOf = (m: OrgMember): string =>
  typeof m.user_id === "string" ? m.user_id : (m.user_id?.name ?? "Unknown");

const detailOf = (m: OrgMember): string => {
  if (typeof m.user_id === "string") return m.role;
  return m.user_id?.email || m.role;
};

function initials(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

const OrganizationPeople = ({
  members,
  canInvite,
  orgSlug,
  onInvite,
}: Props) => {
  return (
    <section className="panel account-section">
      <div className="section-heading">
        <h2 className="label-md">People in your workspace</h2>
        {orgSlug && (
          <Link
            to={getRoutePath("USERS") as never}
            params={{ orgSlug } as never}
            className="text-button label-sm"
          >
            View team
            <ArrowRight size={13} />
          </Link>
        )}
      </div>
      {members.slice(0, 4).map((m) => {
        const name = nameOf(m);
        return (
          <div className="account-person" key={m._id}>
            <span className="account-initials label-xs" aria-hidden="true">
              {initials(name)}
            </span>
            <span>
              <strong className="label-sm">{name}</strong>
              <small className="para-xs org-muted">{detailOf(m)}</small>
            </span>
            <span className="badge green label-xs">Active</span>
          </div>
        );
      })}
      {members.length === 0 && (
        <p className="account-empty para-sm org-muted">
          No members yet. Invite your first teammate.
        </p>
      )}
      {canInvite && (
        <Button
          variant="ghost"
          className="panel-footer-button"
          onPress={onInvite}
        >
          Invite a teammate
          <ArrowRight size={13} />
        </Button>
      )}
    </section>
  );
};

export default OrganizationPeople;
