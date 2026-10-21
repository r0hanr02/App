import { useApiMutation } from "../../../hooks/useApi";
import type {
  AuthMessageResponse,
  forgetPasswordPayload,
  resetPasswordPayload,
} from "../types";

export const useForgetPassword = () => {
  return useApiMutation<AuthMessageResponse, forgetPasswordPayload>({
    path: "/auth/forgot-password",
    method: "POST",
    mutationKey: ["forget_password"],
  });
};

export const useResetPassword = () => {
  return useApiMutation<AuthMessageResponse, resetPasswordPayload>({
    path: "/auth/reset-password",
    method: "PATCH",
    mutationKey: ["reset_password"],
  });
};
