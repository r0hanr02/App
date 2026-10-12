import { useEffect, useState } from "react";
import { ListTodo } from "lucide-react";
import { Modal } from "../../../../components/ui/Modal/Modal";
import { Input } from "../../../../components/ui/Input/Input";
import { DropDown } from "../../../../components/ui/DropDown/DropDown";
import { Label } from "../../../../components/ui/Form/Form";
import { toast } from "../../../../components/ui/Toast/toast.api";
import {
  useCreateTask,
  type DashboardProject,
  type DashboardTaskPriority,
} from "../../api/home.api";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string | null;
  projects: DashboardProject[];
}

const PRIORITY_OPTIONS: { label: string; value: DashboardTaskPriority }[] = [
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
  { label: "Critical", value: "Critical" },
];

export function CreateTaskModal({
  isOpen,
  onClose,
  orgId,
  projects,
}: CreateTaskModalProps) {
  const [projectId, setProjectId] = useState<string>(
    projects[0]?._id ?? "",
  );
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState<DashboardTaskPriority>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setProjectId(projects[0]?._id ?? "");
      setTaskName("");
      setPriority("Medium");
      setDueDate("");
      setNameError(undefined);
    }
  }, [isOpen, projects]);

  const createTask = useCreateTask(orgId, projectId || null);

  const handleSubmit = () => {
    if (!taskName.trim()) {
      setNameError("Task name is required");
      return;
    }
    if (!projectId) {
      toast.warning("No project selected", "Pick a project first.");
      return;
    }
    createTask.mutate(
      {
        task_name: taskName.trim(),
        priority,
        ...(dueDate ? { due_date: dueDate } : {}),
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || "Task created successfully");
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      header={{
        title: "Create task",
        description: "Add a task to a project in this workspace.",
        icon: <ListTodo size={18} />,
      }}
      footer={
        projects.length === 0
          ? { submit: { hidden: true }, dismiss: { text: "Close" } }
          : {
              dismiss: { text: "Cancel" },
              submit: {
                text: "Create task",
                onPress: handleSubmit,
                loading: createTask.isPending,
              },
            }
      }
    >
      {projects.length === 0 ? (
        <p className="empty-note">
          No projects in this workspace yet. Create a project first, then add
          tasks to it.
        </p>
      ) : (
        <div className="create-task-form">
          <div>
            <Label className="create-task-label">Project</Label>
            <DropDown
              options={projects.map((p) => ({
                label: p.project_name,
                value: p._id,
              }))}
              value={projectId}
              onChange={setProjectId}
              ariaLabel="Select project"
            />
          </div>
          <Input
            label="Task name"
            placeholder="e.g. Design review prep"
            value={taskName}
            maxLength={200}
            error={nameError}
            onChange={(e) => {
              setTaskName(e.target.value);
              if (nameError) setNameError(undefined);
            }}
          />
          <div className="create-task-row">
            <div>
              <Label className="create-task-label">Priority</Label>
              <DropDown
                options={PRIORITY_OPTIONS}
                value={priority}
                onChange={(v) => setPriority(v as DashboardTaskPriority)}
                ariaLabel="Select priority"
              />
            </div>
            <Input
              label="Due date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

export default CreateTaskModal;
