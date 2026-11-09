import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apifetch } from "../../../configs/api";
import { useApiMutation, useApiQuery } from "../../../hooks/useApi";
import type {
  TaskCreatePayload,
  TaskMessageResponse,
  TaskQuery,
  TaskResponse,
  TasksListResponse,
  TaskUpdatePayload,
} from "../types";

export type {
  TaskAssignee,
  TaskCreatePayload,
  TaskData,
  TaskMessageResponse,
  TaskPagination,
  TaskPriority,
  TaskQuery,
  TaskResponse,
  TasksListResponse,
  TaskStatus,
  TaskType,
  TaskUpdatePayload,
  TaskUserRef,
  TaskView,
} from "../types";

const taskKeys = {
  root: (orgId: string | null, projectId: string | null) => [
    "tasks",
    orgId,
    projectId,
  ],
  list: (
    orgId: string | null,
    projectId: string | null,
    query: TaskQuery,
  ) => [...taskKeys.root(orgId, projectId), "list", query],
  detail: (
    orgId: string | null,
    projectId: string | null,
    taskId: string | null,
  ) => [...taskKeys.root(orgId, projectId), "detail", taskId],
  projectBoard: (orgId: string | null, projectId: string | null) => [
    "get_project_tasks",
    orgId,
    projectId,
  ],
};

const buildTaskQuery = (query: TaskQuery) => {
  const params = new URLSearchParams();

  if (query.status) params.set("status", query.status);
  if (query.priority) params.set("priority", query.priority);
  if (query.type) params.set("type", query.type);
  if (query.assignee_id) params.set("assignee_id", query.assignee_id);
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const invalidateTasks = (
  queryClient: ReturnType<typeof useQueryClient>,
  orgId: string | null,
  projectId: string | null,
) => {
  queryClient.invalidateQueries({ queryKey: taskKeys.root(orgId, projectId) });
  queryClient.invalidateQueries({
    queryKey: taskKeys.projectBoard(orgId, projectId),
  });
};

export const useGetProjectTasks = (
  orgId: string | null,
  projectId: string | null,
) =>
  useApiQuery<TasksListResponse>({
    path: `/organization/${orgId}/projects/${projectId}/tasks?limit=100`,
    queryKey: taskKeys.projectBoard(orgId, projectId),
    method: "GET",
    options: { enabled: Boolean(orgId) && Boolean(projectId) },
  });

export const useGetTasks = (
  orgId: string | null,
  projectId: string | null,
  query: TaskQuery = {},
) =>
  useApiQuery<TasksListResponse>({
    path: `/organization/${orgId}/projects/${projectId}/tasks${buildTaskQuery(query)}`,
    queryKey: taskKeys.list(orgId, projectId, query),
    method: "GET",
    options: { enabled: Boolean(orgId) && Boolean(projectId) },
  });

export const useGetTask = (
  orgId: string | null,
  projectId: string | null,
  taskId: string | null,
) =>
  useApiQuery<TaskResponse>({
    path: `/organization/${orgId}/projects/${projectId}/tasks/${taskId}`,
    queryKey: taskKeys.detail(orgId, projectId, taskId),
    method: "GET",
    options: {
      enabled: Boolean(orgId) && Boolean(projectId) && Boolean(taskId),
    },
  });

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
      onSuccess: () => invalidateTasks(queryClient, orgId, projectId),
    },
  });
};

export const useUpdateTask = (
  orgId: string | null,
  projectId: string | null,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_task", orgId, projectId],
    mutationFn: async (
      input: { taskId: string } & TaskUpdatePayload,
    ): Promise<TaskResponse> => {
      const { taskId, ...payload } = input;
      const res = await apifetch<TaskResponse>({
        path: `/organization/${orgId}/projects/${projectId}/tasks/${taskId}`,
        method: "PATCH",
        data: payload,
      });
      return res.data;
    },
    onSuccess: () => invalidateTasks(queryClient, orgId, projectId),
  });
};

export const useAssignTask = (
  orgId: string | null,
  projectId: string | null,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["assign_task", orgId, projectId],
    mutationFn: async (input: {
      taskId: string;
      assignee_id: string | null;
    }): Promise<TaskResponse> => {
      const res = await apifetch<TaskResponse>({
        path: `/organization/${orgId}/projects/${projectId}/tasks/${input.taskId}/assign`,
        method: "PATCH",
        data: { assignee_id: input.assignee_id },
      });
      return res.data;
    },
    onSuccess: () => invalidateTasks(queryClient, orgId, projectId),
  });
};

export const useDeleteTask = (
  orgId: string | null,
  projectId: string | null,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete_task", orgId, projectId],
    mutationFn: async (taskId: string): Promise<TaskMessageResponse> => {
      const res = await apifetch<TaskMessageResponse>({
        path: `/organization/${orgId}/projects/${projectId}/tasks/${taskId}`,
        method: "DELETE",
      });
      return res.data;
    },
    onSuccess: () => invalidateTasks(queryClient, orgId, projectId),
  });
};
