import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import PageHeading from "../../../../components/ui/PageHeading/PageHeading";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { getRoutePath } from "../../../../factories/RouteFactory";
import {
  useOrganization,
  useOrganizationMembers,
  useOrganizationProjects,
} from "../../api/organization.api";
import {
  InviteMemberDialog,
  OrganizationDetails,
  OrganizationHero,
  OrganizationMetrics,
  OrganizationPeople,
  OrganizationProjects,
} from "../../components";
import "./style.scss";

const Organization = () => {
  const {
    activeOrgId,
    activeOrg,
    activeOrgSlug,
    isLoading: isOrgsLoading,
  } = useActiveOrg();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { data: org, isLoading: isOrgLoading } = useOrganization(activeOrgId);
  const { data: members = [], isLoading: isMembersLoading } =
    useOrganizationMembers(activeOrgId);
  const { data: projects = [], isLoading: isProjectsLoading } =
    useOrganizationProjects(activeOrgId);

  const role = activeOrg?.role ?? "";
  const canManage = role === "OWNER" || role === "ADMIN";
  const isOwner = role === "OWNER";
  const isLoading = isOrgsLoading || isOrgLoading;

  if (!isOrgsLoading && !activeOrgId) {
    return (
      <div className="organization-page">
        <PageHeading
          topPara="Workspace overview"
          title="Organization"
          subtitle="The people, projects, and purpose behind your workspace."
        />
        <section className="panel org-empty">
          <h2 className="title-sm">No workspace selected</h2>
          <p className="para-sm org-muted">
            Create or join a workspace to see its organization overview.
          </p>
          <Link
            to={getRoutePath("ONBOARDING") as never}
            className="button-base"
            data-variant="primary"
          >
            Create workspace
          </Link>
        </section>
      </div>
    );
  }

  if (isLoading || !org) {
    return (
      <div className="organization-page" aria-busy="true">
        <PageHeading
          topPara="Workspace overview"
          title="Organization"
          subtitle="The people, projects, and purpose behind your workspace."
        />
        <div className="org-loading">
          <Loader2 className="org-spinner" size={22} />
          <p className="para-sm org-muted">Loading workspace…</p>
          <div className="skeleton skeleton-hero" />
          <div className="skeleton-grid">
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
          </div>
          <div className="skeleton skeleton-panel" />
        </div>
      </div>
    );
  }

  return (
    <div className="organization-page">
      <PageHeading
        topPara="Workspace overview"
        title="Organization"
        subtitle="The people, projects, and purpose behind your workspace."
        action={canManage ? "Invite member" : undefined}
        onAction={canManage ? () => setIsInviteOpen(true) : undefined}
      />

      <OrganizationHero org={org} role={role} orgSlug={activeOrgSlug} />

      <OrganizationMetrics
        memberCount={members.length}
        projectCount={projects.length}
        role={role}
        orgSlug={activeOrgSlug}
      />

      <div className="account-grid">
        <OrganizationDetails
          org={org}
          role={role}
          memberCount={members.length}
        />
        <OrganizationPeople
          members={isMembersLoading ? [] : members}
          canInvite={canManage}
          orgSlug={activeOrgSlug}
          onInvite={() => setIsInviteOpen(true)}
        />
      </div>

      <OrganizationProjects
        projects={isProjectsLoading ? [] : projects}
        orgSlug={activeOrgSlug}
      />

      <InviteMemberDialog
        orgId={activeOrgId}
        isOwner={isOwner}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
};

export default Organization;
