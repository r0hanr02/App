import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apifetch } from "../../../configs/api";
import { useApiMutation, useApiQuery } from "../../../hooks/useApi";
import type {
  AddProjectMemberPayload,
  AllProjectsDataResponse,
  ProjectMemberData,
  ProjectMembersResponse,
  projectPayload,
  projectResponse,
  ProjectUpdatePayload,
  SingleProjectResponse,
} from "../types";

export type {
  AddProjectMemberPayload,
  AllProjectsDataResponse,
  Pagination,
  ProjectCardProps,
  ProjectData,
  ProjectMemberData,
  ProjectMembersResponse,
  ProjectModalProps,
  projectPayload,
  projectResponse,
  ProjectUpdatePayload,
  SingleProjectResponse,
  TaskAssignee,
  TaskCreatePayload,
  TaskData,
  TaskPriority,
  TaskResponse,
  TasksListResponse,
  TaskStatus,
  TaskType,
  TaskUpdatePayload,
} from "../types";

export const useCreateProjects = (orgId: string) => {
  return useApiMutation<projectResponse, projectPayload>({
    path: `/organization/${orgId}/projects`,
    method: "POST",
    mutationKey: ["create_project", orgId],
  });
};
export const useGetAllProjects = (orgId: string | null, limit = 10) => {
  return useApiQuery<AllProjectsDataResponse>({
    path: `/organization/${orgId}/projects?limit=${limit}`,
    queryKey: ["get_all_projects", orgId, limit],
    method: "GET",
    options: { enabled: Boolean(orgId) },
  });
};

export const useGetProject = (
  orgId: string | null,
  projectId: string | null,
) => {
  return useApiQuery<SingleProjectResponse>({
    path: `/organization/${orgId}/projects/${projectId}`,
    queryKey: ["get_project", orgId, projectId],
    method: "GET",
    options: { enabled: Boolean(orgId) && Boolean(projectId)},
  });
};

export const useUpdateProject = (
  orgId: string | null,
  projectId: string | null,
) => {
  const queryClient = useQueryClient();
  const mutation = useApiMutation<projectResponse, ProjectUpdatePayload>({
    path: `/organization/${orgId}/projects/${projectId}`,
    method: "PATCH",
    mutationKey: ["update_project", orgId, projectId],
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get_project", orgId, projectId],
        });
        queryClient.invalidateQueries({
          queryKey: ["get_all_projects", orgId],
        });
      },
    },
  });
  return mutation;
};

export const useDeleteProject = (
  orgId: string | null,
  projectId: string | null,
) => {
  const queryClient = useQueryClient();
  return useApiMutation<{ message: string }, void>({
    path: `/organization/${orgId}/projects/${projectId}`,
    method: "DELETE",
    mutationKey: ["delete_project", orgId, projectId],
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get_all_projects", orgId],
        });
      },
    },
  });
};

export const useGetProjectMembers = (
  orgId: string | null,
  projectId: string | null,
) => {
  return useApiQuery<ProjectMembersResponse>({
    path: `/organization/${orgId}/projects/${projectId}/members`,
    queryKey: ["get_project_members", orgId, projectId],
    method: "GET",
    options: { enabled: Boolean(orgId) && Boolean(projectId) },
  });
};

export const useAddProjectMember = (
  orgId: string | null,
  projectId: string | null,
) => {
  const queryClient = useQueryClient();
  return useApiMutation<{ message: string }, AddProjectMemberPayload>({
    path: `/organization/${orgId}/projects/${projectId}/members`,
    method: "POST",
    mutationKey: ["add_project_member", orgId, projectId],
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get_project_members", orgId, projectId],
        });
      },
    },
  });
};

export const useRemoveProjectMember = (
  orgId: string | null,
  projectId: string | null,
) => {
  const queryClient = useQueryClient();
  // userId is dynamic per call, so build the path inside mutationFn
  // while still using apifetch + invalidation like the hooks above.
  return useMutation({
    mutationKey: ["remove_project_member", orgId, projectId],
    mutationFn: async (userId: string): Promise<{ message: string }> => {
      const res = await apifetch<{ message: string }>({
        path: `/organization/${orgId}/projects/${projectId}/members/${userId}`,
        method: "DELETE",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_project_members", orgId, projectId],
      });
    },
  });
};

export const getProjectMemberUserId = (member: ProjectMemberData): string => {
  return typeof member.user_id === "string"
    ? member.user_id
    : member.user_id._id;
};
