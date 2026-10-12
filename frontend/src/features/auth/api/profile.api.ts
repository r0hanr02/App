import { useApiMutation, useApiQuery } from "../../../hooks/useApi";
import type { UserType } from "../../../store/types";

export interface ProfileMeResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: UserType & {
    phone?: string;
    dateOfBirth?: string;
  };
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  occupation?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    name: string;
    email: string;
    occupation?: string;
    phone?: string;
    dateOfBirth?: string;
    profilepic?: string;
  };
}

export const useGetProfile = () => {
  return useApiQuery<ProfileMeResponse>({
    path: "/auth/me",
    queryKey: ["profile_me"],
    method: "GET",
  });
};

export const useUpdateProfile = () => {
  return useApiMutation<UpdateProfileResponse, UpdateProfilePayload>({
    path: "/auth/me",
    method: "PATCH",
    mutationKey: ["update_profile"],
  });
};
