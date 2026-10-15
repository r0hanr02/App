import { useState } from "react";
import { Form } from "../../../../components/ui/Form/Form";
import { Modal } from "../../../../components/ui/Modal/Modal";
import {
  TextArea,
  TextField,
} from "../../../../components/ui/TextField/TextField";
import "./style.scss";
import { Button } from "../../../../components/ui/Button/Button";
import { useCreateProjects } from "../../api/projects.api";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { queryClient } from "../../../../lib/queryClient";
const ProjectModal = ({
  isOpen,
  onClose,
  orgId,
}: {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}) => {
  const [formData, setFormData] = useState({
    project_name: "",
    project_description: "",
  });

  const { mutate: createProject, isPending } = useCreateProjects(orgId);

  const handleCreate = () => {
    createProject(formData, {
      onSuccess: (res) => {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["get_all_projects"] });
        onClose();
      },
    });
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={{
        title: "Create a Project",
      }}
      footer={{
        hidden: true,
      }}
    >
      <Form>
        <TextField
          name="project_name"
          label="Project Name"
          placeholder="Give your big idea a name "
          value={formData.project_name}
          onChange={(value) => {
            setFormData((prev) => ({
              ...prev,
              project_name: value,
            }));
          }}
        />

        <TextArea
          name="project_desc"
          label="Description"
          placeholder="What are we building"
          value={formData.project_description}
          onChange={(value) => {
            setFormData((prev) => ({
              ...prev,
              project_description: value,
            }));
          }}
        />

        <div className="line"></div>
        <div className="project-btn">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreate} isPending={isPending}>
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ProjectModal;
