import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apifetch } from "../../../configs/api";
import { useApiMutation, useApiQuery } from "../../../hooks/useApi";
import type {
  TaskCreatePayload,
  TaskResponse,
  TasksListResponse,
  TaskUpdatePayload,
} from "../types";

export type {
  TaskCreatePayload,
  TaskResponse,
  TasksListResponse,
  TaskUpdatePayload,
} from "../types";

const taskListKey = (orgId: string | null, projectId: string | null) => [
  "get_project_tasks",
  orgId,
  projectId,
];

export const useGetProjectTasks = (
  orgId: string | null,
  projectId: string | null,
) => {
  return useApiQuery<TasksListResponse>({
    // limit=100 so Overview counts + Board/List share one fetch;
    // backend defaults to page=1/limit=10 without it.
    path: `/organization/${orgId}/projects/${projectId}/tasks?limit=100`,
    queryKey: taskListKey(orgId, projectId),
    method: "GET",
    options: { enabled: Boolean(orgId) && Boolean(projectId) },
  });
};

export const useCreateTask = (
  orgId: string | null,
  projectId: string | null,
) => {
  const queryClient = useQueryClient();
  return useApiMutation<TaskResponse, TaskCreatePayload>({
    path: `/organization/${orgId}/projects/${projectId}/tasks`,
    method: "POST",
    mutationKey: ["create_task", orgId, projectId],
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: taskListKey(orgId, projectId),
        });
      },
    },
  });
};

// taskId varies per call, so the path is built inside mutationFn
// (same apifetch + invalidation pattern as projects.api.ts).
export const useUpdateTask = (
  orgId: string | null,
  projectId: string | null,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_task", orgId, projectId],
    mutationFn: async (input: { taskId: string } & TaskUpdatePayload) => {
      const { taskId, ...payload } = input;
      const res = await apifetch<TaskResponse>({
        path: `/organization/${orgId}/projects/${projectId}/tasks/${taskId}`,
        method: "PATCH",
        data: payload,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskListKey(orgId, projectId),
      });
    },
  });
};

export const useDeleteTask = (
  orgId: string | null,
  projectId: string | null,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete_task", orgId, projectId],
    mutationFn: async (taskId: string) => {
      const res = await apifetch<{ message: string }>({
        path: `/organization/${orgId}/projects/${projectId}/tasks/${taskId}`,
        method: "DELETE",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskListKey(orgId, projectId),
      });
    },
  });
};
