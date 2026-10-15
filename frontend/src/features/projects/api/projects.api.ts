import { useApiMutation, useApiQuery } from "../../../hooks/useApi";

export type ProjectData = {
  _id: string;
  project_name: string;
  project_description?: string;
  organization_id: string;
  createdAt: string;
  updatedAt: string;
};

type projectResponse = {
  message: string;
  data: ProjectData;
};

type Pagination = {
  currentPage: number;
  pageLimit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type AllProjectsDataResponse = {
  message: string;
  data: ProjectData[];
  pagination:Pagination
};

export type projectPayload = {
  project_name: string;
  project_description: string;
};
export const useCreateProjects = (orgId: string) => {
  return useApiMutation<projectResponse, projectPayload>({
    path: `/organization/${orgId}/projects`,
    method: "POST",
    mutationKey: ["create_project", orgId],
  });
};
export const useGetAllProjects = (orgId: string | null) => {
  return useApiQuery<AllProjectsDataResponse>({
    path:`/organization/${orgId}/projects`,
    queryKey:["get_all_projects",orgId],
    method:"GET",
    options: { enabled: Boolean(orgId) },
  });
};
