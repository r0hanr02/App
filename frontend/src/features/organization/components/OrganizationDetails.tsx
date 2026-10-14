import { Building2, Shield } from "lucide-react";
import type { Organization } from "../api/organization.api";

interface Props {
  org: Organization;
  role: string;
  memberCount: number;
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Workspace administrator",
  ADMIN: "Workspace administrator",
  MEMBER: "Workspace member",
};

const OrganizationDetails = ({ org, role, memberCount }: Props) => {
  const isAdmin = role === "OWNER" || role === "ADMIN";
  return (
    <section className="panel account-section">
      <div className="section-heading">
        <h2 className="label-md">Organization details</h2>
        <Building2 size={16} />
      </div>
      <dl className="account-facts">
        <div>
          <dt className="para-xs">Name</dt>
          <dd className="label-sm">{org.organization_name}</dd>
        </div>
        <div>
          <dt className="para-xs">Workspace URL</dt>
          <dd className="label-sm">orbit / {org.slug ?? "—"}</dd>
        </div>
        <div>
          <dt className="para-xs">Your permissions</dt>
          <dd className="label-sm">{ROLE_LABEL[role] ?? role}</dd>
        </div>
        <div>
          <dt className="para-xs">Members</dt>
          <dd className="label-sm">
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </dd>
        </div>
      </dl>
      <div className="account-callout">
        <Shield size={17} />
        <p className="para-xs">
          {isAdmin
            ? "As an admin, you can manage members, project access, and organization settings."
            : "You are a member of this workspace. Contact an admin to manage members or settings."}
        </p>
      </div>
    </section>
  );
};

export default OrganizationDetails;
