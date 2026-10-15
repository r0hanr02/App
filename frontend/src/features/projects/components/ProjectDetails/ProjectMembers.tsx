import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../../components/ui/Button/Button";
import DropDown from "../../../../components/ui/DropDown/DropDown";
import { Table } from "../../../../components/ui/Table/Table";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { useOrganizationMembers } from "../../../organization/api/organization.api";
import {
  useAddProjectMember,
  useGetProjectMembers,
  useRemoveProjectMember,
} from "../../api/projects.api";

const userIdOf = (m: { user_id: { _id: string } | string }): string =>
  typeof m.user_id === "string" ? m.user_id : m.user_id._id;
const nameOf = (m: { user_id: { name: string } | string }): string =>
  typeof m.user_id === "string" ? m.user_id : (m.user_id.name ?? "Unknown");
const emailOf = (m: { user_id: { email?: string } | string }): string =>
  typeof m.user_id === "string" ? "" : (m.user_id.email ?? "");

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

const ProjectMembers = ({
  orgId,
  projectId,
  canManage,
}: {
  orgId: string;
  projectId: string;
  canManage: boolean;
}) => {
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

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>
          Project members <span className="count-pill">{members.length}</span>
        </h2>
      </div>
      {canManage && (
        <div className="member-add flex fdc">
          <div className="flex jcsb g12">
            <DropDown
              ariaLabel="Select organization member to add"
              value={selected}
              onChange={setSelected}
              placeholder="Select a workspace member"
              options={available}
            />
            <Button
              variant="secondary"
              leftIcon={<Plus size={15} />}
              isDisabled={!selected || addMember.isPending}
              onPress={() => {
                if (!selected) return;
                addMember.mutate(
                  { user_id: selected },
                  {
                    onSuccess: (res) => {
                      toast.success(res.message);
                      setSelected("");
                    },
                  },
                );
              }}
            >
              {addMember.isPending ? "Adding…" : "Add to project"}
            </Button>
          </div>
          {available.length === 0 && (
            <span className="para-xs org-muted">
              Everyone in the workspace is already in this project.
            </span>
          )}
        </div>
      )}
      <Table
        data={members}
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
          ...(canManage
            ? [
                {
                  accessor: "_id",
                  label: "Actions",
                  render: ({
                    row,
                  }: {
                    row: { _id: string; user_id: { _id: string } | string };
                  }) => (
                    <Button
                      variant="danger"
                      size="sm"
                      isDisabled={removeMember.isPending}
                      onPress={() =>
                        removeMember.mutate(userIdOf(row), {
                          onSuccess: (res) => toast.success(res.message),
                        })
                      }
                    >
                      Remove
                    </Button>
                  ),
                },
              ]
            : []),
        ]}
        rowKey="_id"
        noDataMessage="No project members yet."
      />
    </section>
  );
};

export default ProjectMembers;
