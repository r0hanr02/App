import { useQuery } from "@tanstack/react-query";
import { apifetch } from "../../../configs/api";
import type { OrgProject, ProjectsResponse } from "../types";

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

export type { OrgProject, ProjectsResponse } from "../types";

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
