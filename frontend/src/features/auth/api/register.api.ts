import { useApiMutation } from "../../../hooks/useApi";
import type { RegisterResponse } from "../types";

export type { RegisterResponse } from "../types";

export const useRegisterUserProfile = () => {
  return useApiMutation<RegisterResponse, FormData>({
    path: "/auth/register",
    method: "POST",
    mutationKey: ["register_a_user"],
  });
};
