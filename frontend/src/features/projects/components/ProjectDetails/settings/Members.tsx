import { useState } from "react";
import { Button } from "../../../../../components/ui/Button/Button";
import DropDown from "../../../../../components/ui/DropDown/DropDown";
import { Label } from "../../../../../components/ui/Form/Form";
import { toast } from "../../../../../components/ui/Toast/toast.api";
import { useOrganizationMembers } from "../../../../organization/api/organization.api";
import {
  useAddProjectMember,
  useGetProjectMembers,
  useRemoveProjectMember,
} from "../../../api/projects.api";
import type { ProjectMemberData, ProjectSettingsProps } from "../../../types";

const userIdOf = (m: ProjectMemberData): string =>
  typeof m.user_id === "string" ? m.user_id : m.user_id._id;
const nameOf = (m: ProjectMemberData): string =>
  typeof m.user_id === "string" ? m.user_id : (m.user_id.name ?? "Unknown");
const emailOf = (m: ProjectMemberData): string =>
  typeof m.user_id === "string" ? "" : (m.user_id.email ?? "");

const ProjectMembersSettings = ({
  orgId,
  projectId,
  canManage,
}: ProjectSettingsProps) => {
  const { data: membersRes, isLoading } = useGetProjectMembers(
    orgId,
    projectId,
  );
  const { data: orgMembers = [] } = useOrganizationMembers(orgId);
  const addMember = useAddProjectMember(orgId, projectId);
  const removeMember = useRemoveProjectMember(orgId, projectId);

  const [selected, setSelected] = useState("");

  if (isLoading) return <p>Loading…</p>;

  const members = membersRes?.data ?? [];
  const memberIds = new Set(members.map(userIdOf));
  const available = orgMembers
    .map((m) => ({
      label:
        typeof m.user_id === "string"
          ? m.user_id
          : `${m.user_id.name} (${m.user_id.email})`,
      value: typeof m.user_id === "string" ? m.user_id : m.user_id._id,
    }))
    .filter((o) => !memberIds.has(o.value));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !selected || addMember.isPending) return;
    addMember.mutate(
      { user_id: selected },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          setSelected("");
        },
      },
    );
  };

  return (
    <>
      <h2>Members</h2>
      <p>
        {members.length} member{members.length === 1 ? "" : "s"} in this
        project. Only workspace members can be added.
      </p>

      {canManage && (
        <form onSubmit={handleAdd}>
          <div className="form-field">
            <Label className="label-sm">Add workspace member</Label>
            <DropDown
              ariaLabel="Select organization member to add"
              value={selected}
              onChange={setSelected}
              placeholder="Select a workspace member"
              options={available}
            />
          </div>
          {available.length === 0 && (
            <p className="para-xs">
              Everyone in the workspace is already in this project.
            </p>
          )}
          <div className="form-footer">
            <Button
              type="submit"
              variant="primary"
              isDisabled={!selected || addMember.isPending}
            >
              {addMember.isPending ? "Adding…" : "Add to project"}
            </Button>
          </div>
        </form>
      )}

      <div className="member-list">
        {members.map((m) => (
          <div className="member-row" key={m._id}>
            <span className="member-avatar" aria-hidden="true">
              {nameOf(m).charAt(0).toUpperCase()}
            </span>
            <span className="member-meta">
              <Label className="label-sm">{nameOf(m)}</Label>
              <span className="para-xs">{emailOf(m) || userIdOf(m)}</span>
            </span>
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                isDisabled={removeMember.isPending}
                onPress={() =>
                  removeMember.mutate(userIdOf(m), {
                    onSuccess: (res) => toast.success(res.message),
                  })
                }
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        {members.length === 0 && <p>No project members yet.</p>}
      </div>
    </>
  );
};

export default ProjectMembersSettings;
