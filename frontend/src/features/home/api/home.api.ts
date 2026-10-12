import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useApiMutation, useApiQuery } from "../../../hooks/useApi";
import { apifetch } from "../../../configs/api";

type data_response = {
  _id: string;
  organization_id: {
    organization_name: string;
    _id: string;
  };
  user_id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  updatedAt: string;
};

export type org_response = {
  message: string;
  data: data_response[];
};

export interface CreateOrganizationResponse {
  message: string;
  data: {
    organization_name: string;
    organization_logo: string;
    organization_description: string;
    slug: string;
    _id: string;
  };
}

export const userOrganizationQueryOptions = queryOptions({
  queryKey: ["user_organization"],
  queryFn: async () =>
    await apifetch<org_response>({ path: "/organization", method: "GET" }),
  staleTime: 30_000,
});

export const useGetUserOrganization = () => {
  return useApiQuery<org_response>({
    path: "/organization",
    queryKey: userOrganizationQueryOptions.queryKey,
    method: "GET",
  });
};

export const useCreateOrganization = () => {
  return useApiMutation<CreateOrganizationResponse, FormData>({
    path: "/organization",
    method: "POST",
    mutationKey: ["create_organization"],
  });
};

/* ------------------------------------------------------------------ */
/* Home dashboard — org-scoped resources                                */
/* Backend routes (see backend/src/routes):                            */
/*   GET /organization/:orgId/projects?limit=100                       */
/*   GET /organization/:orgId/projects/:projectId/tasks?limit=100       */
/*   GET /organization/:orgId/member                                    */
/* There is no aggregate dashboard endpoint, so the dashboard fans out */
/* per project and derives stats / activity client-side.               */
/* ------------------------------------------------------------------ */

export type DashboardTaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "CANCELLED";

export type DashboardTaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface DashboardProject {
  _id: string;
  project_name: string;
  organization_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  message: string;
  data: DashboardProject[];
  pagination?: {
    currentPage: number;
    pageLimit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PopulatedUser {
  _id: string;
  name: string;
  email?: string;
}

export interface DashboardTask {
  _id: string;
  task_name: string;
  description?: string;
  status: DashboardTaskStatus;
  priority: DashboardTaskPriority;
  type?: string;
  due_date: string | null;
  project_id: string | { _id: string; project_name?: string };
  organization_id: string;
  creator_id: PopulatedUser | string | null;
  assignee_id: PopulatedUser | string | null;
  createdAt: string;
  updatedAt: string;
  /** Client-side join: resolved from the projects list. */
  projectName?: string;
}

export interface TasksResponse {
  message: string;
  data: DashboardTask[];
  pagination?: {
    currentPage: number;
    pageLimit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface OrgMemberUser {
  _id: string;
  name: string;
  email: string;
}

export interface OrgMember {
  _id: string;
  organization_id: string;
  user_id: OrgMemberUser | string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt?: string;
  updatedAt?: string;
}

export interface MembersResponse {
  message: string;
  data: OrgMember[];
}

export interface HomeDashboardData {
  projects: DashboardProject[];
  tasks: DashboardTask[];
  members: OrgMember[];
}

const projectIdOf = (task: DashboardTask): string => {
  if (typeof task.project_id === "string") return task.project_id;
  return task.project_id?._id ?? "";
};

export const useHomeDashboard = (orgId: string | null) => {
  return useQuery<HomeDashboardData>({
    queryKey: ["home_dashboard", orgId],
    enabled: !!orgId,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const id = orgId as string;

      const [projectsRes, membersRes] = await Promise.all([
        apifetch<ProjectsResponse>({
          path: `/organization/${id}/projects?limit=100`,
          method: "GET",
          silent: true,
        }),
        apifetch<MembersResponse>({
          path: `/organization/${id}/member`,
          method: "GET",
          silent: true,
        }),
      ]);

      const projects: DashboardProject[] = projectsRes.data.data ?? [];
      const members: OrgMember[] = membersRes.data.data ?? [];
      const projectNameById = new Map(
        projects.map((p) => [p._id, p.project_name]),
      );

      // Tasks are scoped per project — fan out and tolerate a single
      // project failing (e.g. access revoked mid-flight).
      const tasksNested = await Promise.all(
        projects.map(async (project) => {
          try {
            const res = await apifetch<TasksResponse>({
              path: `/organization/${id}/projects/${project._id}/tasks?limit=100`,
              method: "GET",
              silent: true,
            });
            const rows = res.data.data ?? [];
            return rows.map((task) => ({
              ...task,
              projectName:
                projectNameById.get(projectIdOf(task)) ?? project.project_name,
            }));
          } catch {
            return [] as DashboardTask[];
          }
        }),
      );

      return { projects, members, tasks: tasksNested.flat() };
    },
  });
};

export interface CreateTaskInput {
  task_name: string;
  priority?: DashboardTaskPriority;
  due_date?: string;
}

export interface CreateTaskResponse {
  message: string;
  data: DashboardTask;
}

/** POST /organization/:orgId/projects/:projectId/tasks + dashboard refresh. */
export const useCreateTask = (orgId: string | null, projectId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation<CreateTaskResponse, Error, CreateTaskInput>({
    mutationKey: ["create_task", orgId, projectId],
    mutationFn: async (input) => {
      const res = await apifetch<CreateTaskResponse>({
        path: `/organization/${orgId}/projects/${projectId}/tasks`,
        method: "POST",
        data: {
          task_name: input.task_name,
          ...(input.priority ? { priority: input.priority } : {}),
          ...(input.due_date ? { due_date: input.due_date } : {}),
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home_dashboard", orgId] });
    },
  });
};
