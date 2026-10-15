import { useApiMutation, useApiQuery } from "../../../hooks/useApi";
import type {
  AllProjectsDataResponse,
  projectPayload,
  projectResponse,
} from "../types";

export type {
  AllProjectsDataResponse,
  Pagination,
  ProjectCardProps,
  ProjectData,
  ProjectModalProps,
  projectPayload,
  projectResponse,
} from "../types";

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
