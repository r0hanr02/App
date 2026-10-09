import { useApiMutation, useApiQuery } from "../../../hooks/useApi";

type data_response = {
  _id: string;
  organization_id: {
    organization_name:"string",
    _id:string
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

export interface createOrganizationResponse {
  message: string;
  data: {
    organization_name: string;
    organization_logo: string;
    organization_description: string;
    slug: string;
    _id: string;
  };
}

export const useUserOrganization = () => {
  return useApiQuery<org_response>({
    path: "/organization",
    queryKey: ["user_organization"],
    method: "GET",
  });
};

export const useCreateOrganization = () => {
  return useApiMutation<createOrganizationResponse, FormData>({
    path: "/organization",
    method: "POST",
    mutationKey: ["create_organization"],
  });
};


export const useUserProjects = () =>{
  return useApiQuery
}