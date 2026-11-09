export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "CANCELLED";

export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export type TaskType =
  | "Feature"
  | "Bug"
  | "Improvement"
  | "Task"
  | "Documentation";

export type TaskUserRef = {
  _id: string;
  name: string;
};

export type TaskAssignee = TaskUserRef | string | null;

export type TaskData = {
  _id: string;
  task_name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  due_date: string | null;
  project_id: string;
  organization_id: string;
  creator_id: TaskUserRef | string;
  assignee_id: TaskAssignee;
  is_deleted?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskPagination = {
  currentPage: number;
  pageLimit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type TasksListResponse = {
  message: string;
  data: TaskData[];
  pagination: TaskPagination;
};

export type TaskResponse = {
  message: string;
  data: TaskData;
};

export type TaskMessageResponse = {
  message: string;
};

export type TaskCreatePayload = {
  task_name: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  due_date?: string | null;
  assignee_id?: string | null;
};

export type TaskUpdatePayload = Partial<TaskCreatePayload>;

export type TaskQuery = {
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignee_id?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type TaskView = "List" | "Board";
