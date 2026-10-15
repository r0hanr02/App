import { Building2, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getRoutePath } from "../../../factories/RouteFactory";
import type { OrganizationHeroProps } from "../types";

function formatRole(role: string): string {
  const lower = role.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

const OrganizationHero = ({ org, role, orgSlug }: OrganizationHeroProps) => {
  const name = org.organization_name ?? "Untitled workspace";
  return (
    <section className="panel account-hero">
      {org.organization_logo ? (
        <img
          src={org.organization_logo}
          alt={name}
          className="organization-avatar organization-avatar-img"
          loading="lazy"
        />
      ) : (
        <span className="organization-avatar title-md" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="account-hero-meta">
        <h2 className="title-md">{name}</h2>
        <p className="para-sm org-muted">
          {org.organization_description?.trim() ||
            "A shared home for your team's best work."}
        </p>
        <div className="account-badges">
          <span className="badge green label-xs">
            <Check size={11} />
            Active workspace
          </span>
          <span className="badge label-xs">{formatRole(role)}</span>
        </div>
      </div>
      {orgSlug && (
        <Link
          to={getRoutePath("SETTINGS") as never}
          params={{ orgSlug } as never}
          className="button-base org-manage-link"
          data-variant="secondary"
        >
          <Building2 size={14} />
          Manage organization
        </Link>
      )}
    </section>
  );
};

export default OrganizationHero;
