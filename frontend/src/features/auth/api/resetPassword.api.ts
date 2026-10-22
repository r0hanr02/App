import { useApiMutation } from "../../../hooks/useApi";
import type { AuthMessageResponse, resetPasswordPayload } from "../types";

export const useResetPassword = () => {
  return useApiMutation<AuthMessageResponse, resetPasswordPayload>({
    path: "/auth/reset-password",
    method: "PATCH",
    mutationKey: ["reset_password"],
  });
};
