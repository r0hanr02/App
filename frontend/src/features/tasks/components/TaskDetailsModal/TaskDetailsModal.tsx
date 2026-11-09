import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/Button/Button";
import DropDown from "../../../../components/ui/DropDown/DropDown";
import { Modal } from "../../../../components/ui/Modal/Modal";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { useOrganizationMembers } from "../../../settings/api/settings.api";
import {
  useAssignTask,
  useGetTask,
  useUpdateTask,
} from "../../api/tasks.api";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from "../../constants/tasks.constants";
import type { TaskData, TaskStatus } from "../../types";
import {
  assigneeIdOf,
  assigneeNameOf,
  creatorNameOf,
  formatTaskDate,
  isTaskOverdue,
  memberIdOf,
  memberNameOf,
} from "../../utils/tasks.utils";
import { TaskPriorityBadge, TaskStatusBadge } from "../TaskBadges/TaskBadges";
import "./style.scss";

type TaskDetailsModalProps = {
  orgId: string;
  projectId: string;
  taskId: string;
  canManage: boolean;
  onClose: () => void;
  onEdit: (task: TaskData) => void;
  onDelete: (task: TaskData) => void;
};

const TaskDetailsModal = ({
  orgId,
  projectId,
  taskId,
  canManage,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailsModalProps) => {
  const { data, isLoading, error } = useGetTask(orgId, projectId, taskId);
  const { data: members = [] } = useOrganizationMembers(orgId);
  const updateTask = useUpdateTask(orgId, projectId);
  const assignTask = useAssignTask(orgId, projectId);

  const task = data?.data;

  const memberOptions = members.map((member) => ({
    label: memberNameOf(member),
    value: memberIdOf(member),
  }));

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      header={{
        title: task?.task_name ?? "Task details",
        description: task
          ? `Created by ${creatorNameOf(task)} on ${formatTaskDate(task.createdAt)}`
          : undefined,
      }}
      footer={
        task
          ? {
              custom: (
                <div className="task-details-footer">
                  {canManage && (
                    <Button
                      variant="danger"
                      leftIcon={<Trash2 size={15} />}
                      onPress={() => onDelete(task)}
                    >
                      Delete
                    </Button>
                  )}
                  <div className="task-details-footer-right">
                    <Button variant="secondary" onPress={onClose}>
                      Close
                    </Button>
                    {canManage && (
                      <Button
                        leftIcon={<Pencil size={15} />}
                        onPress={() => onEdit(task)}
                      >
                        Edit task
                      </Button>
                    )}
                  </div>
                </div>
              ),
            }
          : { hidden: true }
      }
    >
      {isLoading && (
        <div className="task-details-loading">
          <Loader2 size={20} className="task-details-spinner" />
          Loading task…
        </div>
      )}

      {!isLoading && error && (
        <p className="task-details-error">
          {error.message || "Unable to load this task."}
        </p>
      )}

      {!isLoading && task && (
        <div className="task-details">
          <div className="task-details-grid">
            <div className="task-detail">
              <span className="task-detail-label">Status</span>
              <div className="task-detail-value">
                {canManage ? (
                  <DropDown
                    ariaLabel="Task status"
                    value={task.status}
                    disabled={updateTask.isPending}
                    onChange={(value) => {
                      if (value === task.status) return;
                      updateTask.mutate(
                        { taskId: task._id, status: value as TaskStatus },
                        {
                          onSuccess: (res) => toast.success(res.message),
                        },
                      );
                    }}
                    options={TASK_STATUSES.map((status) => ({
                      label: TASK_STATUS_LABELS[status],
                      value: status,
                    }))}
                  />
                ) : (
                  <TaskStatusBadge status={task.status} />
                )}
              </div>
            </div>

            <div className="task-detail">
              <span className="task-detail-label">Priority</span>
              <div className="task-detail-value">
                <TaskPriorityBadge priority={task.priority} />
              </div>
            </div>

            <div className="task-detail">
              <span className="task-detail-label">Type</span>
              <div className="task-detail-value">{task.type}</div>
            </div>

            <div className="task-detail">
              <span className="task-detail-label">Assignee</span>
              <div className="task-detail-value">
                {canManage ? (
                  <DropDown
                    ariaLabel="Task assignee"
                    value={assigneeIdOf(task)}
                    disabled={assignTask.isPending}
                    onChange={(value) =>
                      assignTask.mutate(
                        { taskId: task._id, assignee_id: value || null },
                        {
                          onSuccess: (res) => toast.success(res.message),
                        },
                      )
                    }
                    options={[
                      { label: "Unassigned", value: "" },
                      ...memberOptions,
                    ]}
                  />
                ) : (
                  assigneeNameOf(task)
                )}
              </div>
            </div>

            <div className="task-detail">
              <span className="task-detail-label">Due date</span>
              <div
                className={`task-detail-value${
                  isTaskOverdue(task) ? " is-overdue" : ""
                }`}
              >
                {formatTaskDate(task.due_date)}
                {isTaskOverdue(task) && (
                  <span className="task-overdue-text">Overdue</span>
                )}
              </div>
            </div>

            <div className="task-detail">
              <span className="task-detail-label">Last updated</span>
              <div className="task-detail-value">
                {formatTaskDate(task.updatedAt)}
              </div>
            </div>
          </div>

          <div className="task-detail-block">
            <span className="task-detail-label">Description</span>
            <p className="task-detail-description">
              {task.description?.trim() || "No description provided."}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TaskDetailsModal;
