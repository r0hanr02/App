import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useApiMutation } from "../../../hooks/useApi";
import { apifetch } from "../../../configs/api";

export type UserOrgMembership = {
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
  data: UserOrgMembership[];
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
