import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useApiMutation } from "../../../hooks/useApi";
import { apifetch } from "../../../configs/api";
import type {
  CreateOrganizationResponse,
  org_response,
} from "../types";

export type {
  CreateOrganizationResponse,
  org_response,
  UserOrgMembership,
} from "../types";

export const userOrganizationQueryOptions = queryOptions({
  queryKey: ["user_organization"],
  queryFn: async (): Promise<org_response> => {
    const res = await apifetch<org_response>({
      path: "/organization",
      method: "GET",
      // withCredentials:true
    });
    return res.data;
  },
  staleTime: 30_000,
});

export const useGetUserOrganization = () => {
  return useQuery(userOrganizationQueryOptions);
};

export const useCreateOrganization = () => {
  return useApiMutation<CreateOrganizationResponse, FormData>({
    path: "/organization",
    method: "POST",
    mutationKey: ["create_organization"],
  });
};
