import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "../../../components/ui/Button/Button";
import { Input } from "../../../components/ui/Input/Input";
import { useActiveOrg } from "../../../hooks/useActiveOrg";
import { ROUTES } from "../../../constants/routes.constants";
import {
  useDeleteOrganization,
  useLeaveOrganization,
  useTransferOwnership,
} from "../api/settings.api";
import { toast } from "../../../components/ui/Toast/toast.api";

const DangerZone = () => {
  const { activeOrgId, activeOrg } = useActiveOrg();
  const navigate = useNavigate();
  const deleteOrg = useDeleteOrganization(activeOrgId);
  const leave = useLeaveOrganization(activeOrgId);
  const transfer = useTransferOwnership(activeOrgId);

  const [targetUserId, setTargetUserId] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const isOwner = activeOrg?.role === "OWNER";
  const orgName = activeOrg?.organization_id.organization_name ?? "workspace";
  const confirmed = confirmText.trim() === orgName;

  const afterOrgGone = () => {
    navigate({ to: ROUTES.NOORGANIZATION.path }).catch(() => {});
  };

  return (
    <>
      <h2>Danger zone</h2>
      <p>Irreversible actions. Please proceed with care.</p>

      <div className="danger-zone-card">
        <h3>Transfer ownership</h3>
        <p>
          {isOwner
            ? "Hand ownership to another member by user ID. You become an admin afterwards."
            : "Only the workspace owner can transfer ownership."}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isOwner || !targetUserId.trim() || transfer.isPending) return;
            transfer.mutate(targetUserId.trim(), {
              onSuccess: () => {
                toast.success("Ownership transferred");
                setTargetUserId("");
              },
            });
          }}
        >
          <Input
            label="New owner user ID"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="Paste a member user ID"
            disabled={!isOwner}
          />
          <div className="form-footer">
            <Button
              type="submit"
              variant="outline"
              isDisabled={!isOwner || transfer.isPending}
            >
              {transfer.isPending ? "Transferring…" : "Transfer"}
            </Button>
          </div>
        </form>
      </div>

      {!isOwner && (
        <div className="danger-zone-card">
          <h3>Leave workspace</h3>
          <p>You will lose access to all projects and tasks in {orgName}.</p>
          <div className="form-footer">
            <Button
              variant="outline"
              isDisabled={leave.isPending}
              onPress={() =>
                leave.mutate(undefined, {
                  onSuccess: () => {
                    toast.success("You left the workspace");
                    afterOrgGone();
                  },
                })
              }
            >
              {leave.isPending ? "Leaving…" : "Leave workspace"}
            </Button>
          </div>
        </div>
      )}

      <div className="danger-zone-card">
        <h3>Delete workspace</h3>
        <p>
          {isOwner
            ? `Type "${orgName}" to confirm. This permanently deletes all projects, tasks and memberships.`
            : "Only the workspace owner can delete the workspace."}
        </p>
        <Input
          label="Confirmation"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={orgName}
          disabled={!isOwner}
        />
        <div className="form-footer">
          <Button
            variant="danger"
            isDisabled={!isOwner || !confirmed || deleteOrg.isPending}
            onPress={() =>
              deleteOrg.mutate(undefined, {
                onSuccess: () => {
                  toast.success("Workspace deleted");
                  afterOrgGone();
                },
              })
            }
          >
            {deleteOrg.isPending ? "Deleting…" : "Delete workspace"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default DangerZone;
