import { useMemo, useState } from "react";
import { EllipsisVertical, Search, UserX } from "lucide-react";
import PageHeading from "../../../../components/ui/PageHeading/PageHeading";
import { DropDown } from "../../../../components/ui/DropDown/DropDown";
import ThreeDotMenu from "../../../../components/ui/ThreeDotMenu/ThreeDotMenu";
import { Table } from "../../../../components/ui/Table/Table";
import { TextField } from "../../../../components/ui/TextField/TextField";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { useStore } from "../../../../store/store";
import {
  useChangeMemberRole,
  useOrganizationMembers,
  useRemoveMember,
} from "../../../organization/api/organization.api";
import { InviteMemberDialog } from "../../../organization/components";
import type { OrgMember } from "../../../settings/types";
import "./style.scss";

const userIdOf = (m: OrgMember): string =>
  typeof m.user_id === "string" ? m.user_id : m.user_id._id;
const nameOf = (m: OrgMember): string =>
  typeof m.user_id === "string" ? m.user_id : (m.user_id.name ?? "Unknown");
const emailOf = (m: OrgMember): string =>
  typeof m.user_id === "string" ? "" : (m.user_id.email ?? "");

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

const ROLE_OPTIONS = [
  { label: "Member", value: "MEMBER" },
  { label: "Admin", value: "ADMIN" },
] as const;

type RoleInput = (typeof ROLE_OPTIONS)[number]["value"];

const Teams = () => {
  const { activeOrgId, activeOrg } = useActiveOrg();
  const currentUserId = useStore((s) => s.data?.user?.id);

  const { data: members = [], isLoading } = useOrganizationMembers(activeOrgId);
  const changeRole = useChangeMemberRole(activeOrgId);
  const removeMember = useRemoveMember(activeOrgId);

  const [query, setQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const myRole = activeOrg?.role;
  const canManage = myRole === "OWNER" || myRole === "ADMIN";
  const isOwner = myRole === "OWNER";

  const visibleMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const name = nameOf(m).toLowerCase();
      const email = emailOf(m).toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [members, query]);

  return (
    <div className="teams-page">
      <PageHeading
        topPara="Workspace overview"
        title="Teams"
        subtitle="Great work starts with great people."
        action={canManage ? "Invite member" : undefined}
        onAction={canManage ? () => setIsInviteOpen(true) : undefined}
      />

      <div className="toolbar">
        <TextField
          placeholder="Search members..."
          aria-label="Search members"
          value={query}
          onChange={setQuery}
          leftIcon={<Search size={15} />}
        />
        <span className="toolbar-count">
          {visibleMembers.length} member{visibleMembers.length === 1 ? "" : "s"}
        </span>
      </div>

      <section className="panel table-scroll">
        <Table<OrgMember>
          data={visibleMembers}
          rowKey="_id"
          isLoading={isLoading}
          noDataMessage={
            query ? `No members match "${query}".` : "No members yet."
          }
          columns={[
            {
              accessor: "user_id",
              label: "Member",
              render: ({ row }) => (
                <span className="member-cell">
                  <span className="account-initials" aria-hidden="true">
                    {initialsOf(nameOf(row))}
                  </span>
                  <span>
                    <strong>{nameOf(row)}</strong>
                    <small className="cell-sub">
                      {emailOf(row) || userIdOf(row)}
                    </small>
                  </span>
                </span>
              ),
            },
            {
              accessor: "role",
              label: "Workspace role",
              colCenter: true,
              render: ({ row }) => {
                const uid = userIdOf(row);
                const isSelf = currentUserId != null && uid === currentUserId;
                const canChange = isOwner && !isSelf && row.role !== "OWNER";
                if (!canChange) {
                  return <span className="role-badge">{row.role}</span>;
                }
                return (
                  <DropDown
                    options={[...ROLE_OPTIONS]}
                    value={row.role}
                    onChange={(role) => {
                      if (role === row.role || changeRole.isPending) return;
                      changeRole.mutate(
                        { userId: uid, role: role as RoleInput },
                        {
                          onSuccess: () => toast.success("Member role updated"),
                        },
                      );
                    }}
                    ariaLabel={`Role for ${nameOf(row)}`}
                    disabled={changeRole.isPending}
                  />
                );
              },
            },
            {
              accessor: "_id",
              label: "Status",
              colCenter: true,
              render: () => <span className="badge green">Active</span>,
            },
            {
              accessor: "actions",
              label: "Actions",
              colCenter: true,
              render: ({ row }) => {
                const uid = userIdOf(row);
                const isSelf = currentUserId != null && uid === currentUserId;
                if (!canManage || isSelf) return null;
                return (
                  <span className="row-menu">
                    <ThreeDotMenu
                      ariaLabel={`Actions for ${nameOf(row)}`}
                      trigger={<EllipsisVertical size={16} />}
                      items={[
                        {
                          key: "remove",
                          label: "Remove member",
                          icon: <UserX size={15} />,
                          danger: true,
                          disabled: removeMember.isPending,
                          onClick: () =>
                            removeMember.mutate(uid, {
                              onSuccess: () =>
                                toast.success("Member removed"),
                            }),
                        },
                      ]}
                    />
                  </span>
                );
              },
            },
          ]}
        />
      </section>

      <InviteMemberDialog
        orgId={activeOrgId}
        isOwner={isOwner}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
};

export default Teams;
