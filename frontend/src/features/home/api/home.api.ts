import { useApiMutation, useApiQuery } from "../../../hooks/useApi";

type data_response = {
  _id: string;
  organization_id: string;
  user_id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  updatedAt: string;
};

export type org_response = {
  message: string;
  data: data_response[];
};

export const useUserOrganization =  () => {
  return useApiQuery<org_response>({
    path: "/organization",
    queryKey: ["user_organization"],
    method: "GET",
  });
};


export const useCreateOrganization = () => {
  return useApiMutation({
    path: "/organization",
    method: "POST",
    mutationKey: ["create_organization"],
  })}