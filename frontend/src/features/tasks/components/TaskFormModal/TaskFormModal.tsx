import { useMemo, useState } from "react";
import { Button } from "../../../../components/ui/Button/Button";
import DropDown from "../../../../components/ui/DropDown/DropDown";
import { Form, Label } from "../../../../components/ui/Form/Form";
import { Modal } from "../../../../components/ui/Modal/Modal";
import {
  TextArea,
  TextField,
} from "../../../../components/ui/TextField/TextField";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { useOrganizationMembers } from "../../../settings/api/settings.api";
import { useCreateTask, useUpdateTask } from "../../api/tasks.api";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_TYPES,
} from "../../constants/tasks.constants";
import type {
  TaskCreatePayload,
  TaskData,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "../../types";
import {
  assigneeIdOf,
  memberIdOf,
  memberNameOf,
  toDateInputValue,
  toDueDateISO,
} from "../../utils/tasks.utils";
import "./style.scss";

type TaskFormModalProps = {
  orgId: string;
  projectId: string;
  task?: TaskData | null;
  isOpen: boolean;
  onClose: () => void;
};

const TaskFormModal = ({
  orgId,
  projectId,
  task,
  isOpen,
  onClose,
}: TaskFormModalProps) => {
  const isEditing = Boolean(task);

  const [taskName, setTaskName] = useState(task?.task_name ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "TODO");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "Medium",
  );
  const [type, setType] = useState<TaskType>(task?.type ?? "Task");
  const [dueDate, setDueDate] = useState(toDateInputValue(task?.due_date));
  const [assignee, setAssignee] = useState(
    task ? assigneeIdOf(task) : "",
  );

  const { data: members = [] } = useOrganizationMembers(orgId);
  const createTask = useCreateTask(orgId, projectId);
  const updateTask = useUpdateTask(orgId, projectId);

  const isPending = createTask.isPending || updateTask.isPending;

  const memberOptions = useMemo(
    () =>
      members.map((member) => ({
        label: memberNameOf(member),
        value: memberIdOf(member),
      })),
    [members],
  );

  const handleSubmit = () => {
    if (!taskName.trim()) {
      toast.warning("Task name is required");
      return;
    }

    const payload: TaskCreatePayload = {
      task_name: taskName.trim(),
      description: description.trim(),
      status,
      priority,
      type,
      due_date: toDueDateISO(dueDate),
      assignee_id: assignee || null,
    };

    if (task) {
      updateTask.mutate(
        { taskId: task._id, ...payload },
        {
          onSuccess: (res) => {
            toast.success(res.message ?? "Task updated");
            onClose();
          },
        },
      );
      return;
    }

    createTask.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res.message ?? "Task created");
        onClose();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={{
        title: isEditing ? "Edit task" : "Create a task",
        description: isEditing
          ? "Update task details, status, or ownership."
          : "Add a new task to the selected project.",
      }}
      footer={{ hidden: true }}
    >
      <Form className="task-form">
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
        <div className="task-form-row">
          <div className="task-form-field">
            <Label>Status</Label>
            <DropDown
              ariaLabel="Task status"
              value={status}
              onChange={(value) => setStatus(value as TaskStatus)}
              options={TASK_STATUSES.map((item) => ({
                label: TASK_STATUS_LABELS[item],
                value: item,
              }))}
            />
          </div>
          <div className="task-form-field">
            <Label>Priority</Label>
            <DropDown
              ariaLabel="Task priority"
              value={priority}
              onChange={(value) => setPriority(value as TaskPriority)}
              options={TASK_PRIORITIES.map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </div>
        </div>
        <div className="task-form-row">
          <div className="task-form-field">
            <Label>Type</Label>
            <DropDown
              ariaLabel="Task type"
              value={type}
              onChange={(value) => setType(value as TaskType)}
              options={TASK_TYPES.map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </div>
          <div className="task-form-field">
            <Label>Assignee</Label>
            <DropDown
              ariaLabel="Task assignee"
              value={assignee}
              onChange={setAssignee}
              options={[
                { label: "Unassigned", value: "" },
                ...memberOptions,
              ]}
            />
          </div>
        </div>
        <div className="task-form-field">
          <Label>Due date</Label>
          <input
            type="date"
            className="task-date-input"
            aria-label="Task due date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
        <div className="task-form-line" />
        <div className="task-form-actions">
          <Button variant="secondary" onPress={onClose} isDisabled={isPending}>
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            isPending={isPending}
            isDisabled={!taskName.trim()}
          >
            {isEditing ? "Save changes" : "Create"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;
