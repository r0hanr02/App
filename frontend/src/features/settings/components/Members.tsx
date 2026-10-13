import { useState } from "react";
import { Button } from "../../../components/ui/Button/Button";
import { DropDown } from "../../../components/ui/DropDown/DropDown";
import { Input } from "../../../components/ui/Input/Input";
import { Label } from "../../../components/ui/Form/Form";
import { useActiveOrg } from "../../../hooks/useActiveOrg";
import { useStore } from "../../../store/store";
import {
  useAddMember,
  useChangeMemberRole,
  useLeaveOrganization,
  useOrganizationMembers,
  useRemoveMember,
  type OrgMember,
} from "../api/settings.api";
import { toast } from "../../../components/ui/Toast/toast.api";

const userIdOf = (m: OrgMember): string =>
  typeof m.user_id === "string" ? m.user_id : m.user_id._id;
const nameOf = (m: OrgMember): string =>
  typeof m.user_id === "string" ? m.user_id : (m.user_id.name ?? "Unknown");
const emailOf = (m: OrgMember): string =>
  typeof m.user_id === "string" ? "" : (m.user_id.email ?? "");

const ROLE_OPTIONS = [
  { label: "Member", value: "MEMBER" },
  { label: "Admin", value: "ADMIN" },
] as const;

type RoleInput = (typeof ROLE_OPTIONS)[number]["value"];

const Members = () => {
  const { activeOrgId, activeOrg } = useActiveOrg();
  const currentUserId = useStore((s) => s.data?.user?.id);
  const { data: members = [], isLoading } = useOrganizationMembers(activeOrgId);
  const addMember = useAddMember(activeOrgId);
  const changeRole = useChangeMemberRole(activeOrgId);
  const removeMember = useRemoveMember(activeOrgId);
  const leave = useLeaveOrganization(activeOrgId);

  const [userIdInput, setUserIdInput] = useState("");
  const [roleInput, setRoleInput] = useState<RoleInput>("MEMBER");

  const myRole = activeOrg?.role;
  const canManage = myRole === "OWNER" || myRole === "ADMIN";
  const isOwner = myRole === "OWNER";

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !userIdInput.trim() || addMember.isPending) return;
    addMember.mutate(
      { user_id: userIdInput.trim(), role: roleInput },
      {
        onSuccess: () => {
          toast.success("Member added");
          setUserIdInput("");
        },
      },
    );
  };

  if (isLoading) return <p>Loading…</p>;

  return (
    <>
      <h2>Members</h2>
      <p>
        {members.length} member{members.length === 1 ? "" : "s"} in this
        workspace.
      </p>

      {canManage && (
        <form onSubmit={handleAdd}>
          <Input
            label="Add member by user ID"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            placeholder="Paste a user ID"
          />
          <div className="form-field">
            <Label className="label-sm">Role</Label>
            <DropDown
              options={[...ROLE_OPTIONS]}
              value={roleInput}
              onChange={(v) => setRoleInput(v as RoleInput)}
              ariaLabel="Role for new member"
            />
          </div>
          <div className="form-footer">
            <Button
              type="submit"
              variant="primary"
              isDisabled={addMember.isPending}
            >
              {addMember.isPending ? "Adding…" : "Add member"}
            </Button>
          </div>
        </form>
      )}

      <div className="member-list">
        {members.map((m) => {
          const uid = userIdOf(m);
          const isSelf = currentUserId != null && uid === currentUserId;
          const canChangeRole = isOwner && !isSelf && m.role !== "OWNER";
          return (
            <div className="member-row" key={m._id}>
              <span className="member-avatar" aria-hidden="true">
                {nameOf(m).charAt(0).toUpperCase()}
              </span>
              <span className="member-meta">
                <Label className="label-sm">{nameOf(m)}</Label>
                <span className="para-xs">{emailOf(m) || uid}</span>
              </span>
              {canChangeRole ? (
                <DropDown
                  options={[...ROLE_OPTIONS]}
                  value={m.role}
                  onChange={(role) => {
                    if (role === m.role || changeRole.isPending) return;
                    changeRole.mutate(
                      { userId: uid, role: role as RoleInput },
                      { onSuccess: () => toast.success("Role updated") },
                    );
                  }}
                  ariaLabel={`Change role for ${nameOf(m)}`}
                  disabled={changeRole.isPending}
                  className="member-role-select"
                />
              ) : (
                <span className="role-badge">{m.role}</span>
              )}
              {canManage && !isSelf && (
                <Button
                  variant="outline"
                  size="sm"
                  isDisabled={removeMember.isPending}
                  onPress={() =>
                    removeMember.mutate(uid, {
                      onSuccess: () => toast.success("Member removed"),
                    })
                  }
                >
                  Remove
                </Button>
              )}
              {isSelf && m.role !== "OWNER" && (
                <Button
                  variant="outline"
                  size="sm"
                  isDisabled={leave.isPending}
                  onPress={() =>
                    leave.mutate(undefined, {
                      onSuccess: () => toast.success("You left the workspace"),
                    })
                  }
                >
                  Leave
                </Button>
              )}
            </div>
          );
        })}
        {members.length === 0 && <p>No members yet.</p>}
      </div>
    </>
  );
};

export default Members;
