import { useApiMutation } from "../../../hooks/useApi";
import type { AuthMessageResponse, forgetPasswordPayload } from "../types";

export const useForgetPassword = () => {
  return useApiMutation<AuthMessageResponse, forgetPasswordPayload>({
    path: "/auth/forgot-password",
    method: "POST",
    mutationKey: ["forget_password"],
  });
};
