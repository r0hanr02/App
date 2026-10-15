import { useEffect, useState } from "react";
import { TextArea, TextField } from "../../../../../components/ui/TextField/TextField";
import { Form } from "../../../../../components/ui/Form/Form";
import { toast } from "../../../../../components/ui/Toast/toast.api";
import { useGetProject, useUpdateProject } from "../../../api/projects.api";
import type { ProjectSettingsProps } from "../../../types";
import { Button } from "../../../../../components/ui/Button/Button";


const ProjectGeneral = ({
  orgId,
  projectId,
  canManage,
}: ProjectSettingsProps) => {
  const { data: projectRes, isLoading } = useGetProject(orgId, projectId);
  const update = useUpdateProject(orgId, projectId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const project = projectRes?.data;

  useEffect(() => {
    if (project) {
      setName(project.project_name ?? "");
      setDescription(project.project_description ?? "");
    }
  }, [project]);

  if (isLoading) return <p>Loading…</p>;
  if (!project) return <p>Project not found.</p>;

  const handleSave = () => {
    if (!canManage || !name.trim() || update.isPending) return;
    update.mutate(
      { project_name: name.trim(), project_description: description },
      { onSuccess: (res) => toast.success(res.message) },
    );
  };

  return (
    <>
      <h2>General</h2>
      <p>Update your project name and description.</p>
      <Form>
        <TextField
          label="Project name"
          value={name}
          onChange={setName}
          placeholder="Project name"
          isDisabled={!canManage}
        />
        <TextArea
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="What are we building?"
          isDisabled={!canManage}
        />
      </Form>
      {!canManage && <p>Only owners and admins can edit project details.</p>}
      {canManage && (
        <div className="form-footer">
          <Button
            variant="primary"
            isDisabled={!name.trim() || update.isPending}
            onPress={handleSave}
          >
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}
    </>
  );
};

export default ProjectGeneral;
