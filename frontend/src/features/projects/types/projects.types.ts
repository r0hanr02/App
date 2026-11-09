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

export type {
  TaskAssignee,
  TaskCreatePayload,
  TaskData,
  TaskPagination,
  TaskPriority,
  TaskResponse,
  TasksListResponse,
  TaskStatus,
  TaskType,
  TaskUpdatePayload,
  TaskUserRef,
} from "../../tasks/types";

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
