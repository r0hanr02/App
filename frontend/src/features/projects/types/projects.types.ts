/* Projects API types */

export type ProjectData = {
  _id: string;
  project_name: string;
  project_description?: string;
  organization_id: string;
  createdAt: string;
  updatedAt: string;
};

export type projectResponse = {
  message: string;
  data: ProjectData;
};

export type Pagination = {
  currentPage: number;
  pageLimit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AllProjectsDataResponse = {
  message: string;
  data: ProjectData[];
  pagination: Pagination;
};

export type projectPayload = {
  project_name: string;
  project_description: string;
};

export type ProjectUpdatePayload = {
  project_name?: string;
  project_description?: string;
};

/* Single project response: GET /organization/:orgId/projects/:projectId */
export type SingleProjectResponse = {
  message: string;
  data: ProjectData;
};

/* Project members: GET /organization/:orgId/projects/:projectId/members */
export type ProjectMemberUser = {
  _id: string;
  name: string;
  email: string;
};

export type ProjectMemberData = {
  _id: string;
  project_id: string;
  user_id: ProjectMemberUser | string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectMembersResponse = {
  message: string;
  data: ProjectMemberData[];
};

export type AddProjectMemberPayload = {
  user_id: string;
};

/* Tasks under a project: GET /organization/:orgId/projects/:projectId/tasks */
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

export type TaskAssignee = {
  _id: string;
  name: string;
} | null;

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
  creator_id: TaskAssignee | string;
  assignee_id: TaskAssignee | string;
  is_deleted?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TasksListResponse = {
  message: string;
  data: TaskData[];
  pagination: Pagination;
};

export type TaskResponse = {
  message: string;
  data: TaskData;
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

/* Projects component props */

export type ProjectCardProps = {
  project: ProjectData;
  onOpen?: (project: ProjectData) => void;
};

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

/* Project settings tab props (mirrors workspace Settings tabs) */
export type ProjectSettingsProps = {
  orgId: string;
  projectId: string;
  canManage: boolean;
};
