import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apifetch } from "../../../configs/api";
import type {
  MembersResponse,
  OrgMember,
  Organization,
  OrgResponse,
} from "../types";

export type {
  MembersResponse,
  NotificationPrefs,
  Organization,
  OrgMember,
  OrgMemberUser,
  OrgResponse,
  OrgRole,
} from "../types";

const orgKeys = {
  detail: (orgId: string | null) => ["org", orgId],
  members: (orgId: string | null) => ["org_members", orgId],
};

export const useOrganization = (orgId: string | null) => {
  return useQuery({
    queryKey: orgKeys.detail(orgId),
    enabled: !!orgId,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<Organization> => {
      const res = await apifetch<OrgResponse>({
        path: `/organization/${orgId}`,
        method: "GET",
        silent: true,
      });
      return res.data.data;
    },
  });
};

export const useOrganizationMembers = (orgId: string | null) => {
  return useQuery({
    queryKey: orgKeys.members(orgId),
    enabled: !!orgId,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<OrgMember[]> => {
      const res = await apifetch<MembersResponse>({
        path: `/organization/${orgId}/member`,
        method: "GET",
        silent: true,
      });
      return res.data.data ?? [];
    },
  });
};

const invalidateOrg = (queryClient: ReturnType<typeof useQueryClient>, orgId: string | null) => {
  queryClient.invalidateQueries({ queryKey: ["user_organization"] });
  if (orgId) {
    queryClient.invalidateQueries({ queryKey: orgKeys.detail(orgId) });
    queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) });
  }
};

export const useUpdateOrganization = (orgId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update_organization", orgId],
    mutationFn: async (input: {
      organization_name?: string;
      slug?: string;
      organization_description?: string;
    }): Promise<Organization> => {
      const res = await apifetch<OrgResponse>({
        path: `/organization/${orgId}`,
        method: "PATCH",
        data: input,
      });
      return res.data.data;
    },
    onSuccess: () => invalidateOrg(queryClient, orgId),
  });
};

export const useDeleteOrganization = (orgId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete_organization", orgId],
    mutationFn: async (): Promise<void> => {
      await apifetch<{ message: string }>({
        path: `/organization/${orgId}`,
        method: "DELETE",
      });
    },
    onSuccess: () => invalidateOrg(queryClient, orgId),
  });
};

export const useLeaveOrganization = (orgId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["leave_organization", orgId],
    mutationFn: async (): Promise<void> => {
      await apifetch<{ message: string }>({
        path: `/organization/${orgId}/me`,
        method: "DELETE",
      });
    },
    onSuccess: () => invalidateOrg(queryClient, orgId),
  });
};

export const useAddMember = (orgId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add_org_member", orgId],
    mutationFn: async (input: { user_id: string; role: "ADMIN" | "MEMBER" }): Promise<void> => {
      await apifetch({
        path: `/organization/${orgId}/member`,
        method: "POST",
        data: input,
      });
    },
    onSuccess: () => invalidateOrg(queryClient, orgId),
  });
};

export const useChangeMemberRole = (orgId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["change_member_role", orgId],
    mutationFn: async (input: { userId: string; role: "ADMIN" | "MEMBER" }): Promise<void> => {
      await apifetch({
        path: `/organization/${orgId}/member/${input.userId}`,
        method: "PATCH",
        data: { role: input.role },
      });
    },
    onSuccess: () => invalidateOrg(queryClient, orgId),
  });
};

export const useRemoveMember = (orgId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["remove_org_member", orgId],
    mutationFn: async (userId: string): Promise<void> => {
      await apifetch({
        path: `/organization/${orgId}/member/${userId}`,
        method: "DELETE",
      });
    },
    onSuccess: () => invalidateOrg(queryClient, orgId),
  });
};

export const useTransferOwnership = (orgId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["transfer_ownership", orgId],
    mutationFn: async (targetUserId: string): Promise<void> => {
      await apifetch({
        path: `/organization/${orgId}/transfer-ownership`,
        method: "POST",
        data: { targetUserId },
      });
    },
    onSuccess: () => invalidateOrg(queryClient, orgId),
  });
};
