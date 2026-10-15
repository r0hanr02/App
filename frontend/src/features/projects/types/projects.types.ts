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
