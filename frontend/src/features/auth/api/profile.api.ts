import { useApiMutation, useApiQuery } from "../../../hooks/useApi";
import type {
  ProfileMeResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "../types";

export type {
  ProfileMeResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "../types";

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
