import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ProjectSettingsProps } from "../../../types";
import { useActiveOrg } from "../../../../../hooks/useActiveOrg";
import { useDeleteProject, useGetProject } from "../../../api/projects.api";
import { getRoutePath } from "../../../../../factories/RouteFactory";
import { toast } from "../../../../../components/ui/Toast/toast.api";
import { Input } from "react-aria-components";
import { Button } from "../../../../../components/ui/Button/Button";
import { Modal } from "../../../../../components/ui/Modal/Modal";


const ProjectDangerZone = ({
  orgId,
  projectId,
  canManage,
}: ProjectSettingsProps) => {
  const { activeOrgSlug } = useActiveOrg();
  const navigate = useNavigate();
  const { data: projectRes } = useGetProject(orgId, projectId);
  const remove = useDeleteProject(orgId, projectId);

  const [confirmText, setConfirmText] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const projectName = projectRes?.data?.project_name ?? "project";
  const confirmed = confirmText.trim() === projectName;

  const handleDelete = () => {
    remove.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(res.message ?? "Project deleted");
        setIsDeleteOpen(false);
        navigate({
          to: getRoutePath("PROJECTS") as never,
          params: { orgSlug: activeOrgSlug } as never,
        });
      },
    });
  };

  return (
    <>
      <h2>Danger zone</h2>
      <p>Irreversible actions. Please proceed with care.</p>

      <div className="danger-zone-card">
        <h3>Delete project</h3>
        <p>
          {canManage
            ? `Type "${projectName}" to confirm. This permanently deletes the project and all of its tasks.`
            : "Only owners and admins can delete the project."}
        </p>
        <label>
          Confirmation
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={projectName}
            disabled={!canManage}
          />
        </label>
        <div className="form-footer">
          <Button
            variant="danger"
            isDisabled={!canManage || !confirmed || remove.isPending}
            onPress={() => setIsDeleteOpen(true)}
          >
            {remove.isPending ? "Deleting…" : "Delete project"}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        type="delete"
        header={{ title: "Delete project" }}
        footer={{
          dismiss: { text: "Cancel" },
          submit: {
            text: remove.isPending ? "Deleting…" : "Delete",
            onPress: handleDelete,
          },
        }}
      >
        <p className="para-sm">
          This will permanently delete <strong>{projectName}</strong> and all
          of its tasks. This cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default ProjectDangerZone;
