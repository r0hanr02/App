import { useQuery } from "@tanstack/react-query";
import { apifetch } from "../../../configs/api";

// Re-export the org hooks/types so the Organization feature has a single
// import surface. The backend is the source of truth:
//   GET /organization/:organizationId          -> Organization
//   GET /organization/:organizationId/member   -> OrgMember[]
//   GET /organization/:organizationId/projects -> Project[]
export {
  useOrganization,
  useOrganizationMembers,
  useAddMember,
  useChangeMemberRole,
  useRemoveMember,
  useLeaveOrganization,
  useUpdateOrganization,
  type Organization,
  type OrgMember,
  type OrgMemberUser,
  type OrgRole,
} from "../../settings/api/settings.api";

export interface OrgProject {
  _id: string;
  project_name: string;
  organization_id: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectsResponse {
  message: string;
  data: OrgProject[];
  pagination?: {
    currentPage: number;
    pageLimit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const useOrganizationProjects = (orgId: string | null) => {
  return useQuery({
    queryKey: ["org_projects", orgId],
    enabled: !!orgId,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<OrgProject[]> => {
      const res = await apifetch<ProjectsResponse>({
        path: `/organization/${orgId}/projects`,
        method: "GET",
        silent: true,
      });
      return res.data.data ?? [];
    },
  });
};
