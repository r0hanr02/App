import { useState } from "react";
import { Form, Label } from "../../../../components/ui/Form/Form";
import { Button } from "../../../../components/ui/Button/Button";
import {
  TextArea,
  TextField,
} from "../../../../components/ui/TextField/TextField";
import { Modal } from "../../../../components/ui/Modal/Modal";
import DropDown from "../../../../components/ui/DropDown/DropDown";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { useGetProjectMembers } from "../../api/projects.api";
import { useCreateTask } from "../../api/tasks.api";
import type {
  TaskPriority,
  TaskStatus,
  TaskType,
} from "../../types";

const STATUSES: { label: string; value: TaskStatus }[] = [
  { label: "To do", value: "TODO" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "In review", value: "IN_REVIEW" },
  { label: "Done", value: "DONE" },
  { label: "Cancelled", value: "CANCELLED" },
];

const PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Critical"];
const TYPES: TaskType[] = ["Feature", "Bug", "Improvement", "Task", "Documentation"];

const memberIdOf = (m: {
  user_id: { _id: string; name: string } | string;
}): string => (typeof m.user_id === "string" ? m.user_id : m.user_id._id);
const memberNameOf = (m: {
  user_id: { name: string } | string;
}): string =>
  typeof m.user_id === "string" ? m.user_id : (m.user_id.name ?? "Unknown");

const CreateTaskModal = ({
  orgId,
  projectId,
  isOpen,
  onClose,
}: {
  orgId: string;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [type, setType] = useState<TaskType>("Task");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [assignee, setAssignee] = useState("");

  const { data: membersRes } = useGetProjectMembers(orgId, projectId);
  const { mutate: createTask, isPending } = useCreateTask(orgId, projectId);

  const reset = () => {
    setTaskName("");
    setDescription("");
    setPriority("Medium");
    setType("Task");
    setStatus("TODO");
    setAssignee("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = () => {
    if (!taskName.trim()) {
      toast.warning("Task name is required");
      return;
    }
    createTask(
      {
        task_name: taskName.trim(),
        description,
        priority,
        type,
        status,
        assignee_id: assignee || null,
      },
      {
        onSuccess: (res) => {
          toast.success(res.message ?? "Task created");
          reset();
          onClose();
        },
      },
    );
  };

  const members = membersRes?.data ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      header={{ title: "Create a task" }}
      footer={{ hidden: true }}
    >
      <Form>
        <TextField
          label="Task name"
          value={taskName}
          onChange={setTaskName}
          placeholder="What needs to be done?"
        />
        <TextArea
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Add context, acceptance criteria…"
        />
        <div className="form-row">
          <div>
            <Label>Status</Label>
            <DropDown
              ariaLabel="Task status"
              value={status}
              onChange={(v) => setStatus(v as TaskStatus)}
              options={STATUSES.map((s) => ({
                label: s.label,
                value: s.value,
              }))}
            />
          </div>
          <div>
            <Label>Priority</Label>
            <DropDown
              ariaLabel="Task priority"
              value={priority}
              onChange={(v) => setPriority(v as TaskPriority)}
              options={PRIORITIES.map((p) => ({ label: p, value: p }))}
            />
          </div>
        </div>
        <div className="form-row">
          <div>
            <Label>Type</Label>
            <DropDown
              ariaLabel="Task type"
              value={type}
              onChange={(v) => setType(v as TaskType)}
              options={TYPES.map((t) => ({ label: t, value: t }))}
            />
          </div>
          <div>
            <Label>Assignee</Label>
            <DropDown
              ariaLabel="Task assignee"
              value={assignee}
              onChange={setAssignee}
              placeholder="Unassigned"
              options={members.map((m) => ({
                label: memberNameOf(m),
                value: memberIdOf(m),
              }))}
            />
          </div>
        </div>
        <div className="line" />
        <div className="project-btn">
          <Button variant="secondary" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            onPress={handleCreate}
            isPending={isPending}
            isDisabled={!taskName.trim()}
          >
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateTaskModal;
