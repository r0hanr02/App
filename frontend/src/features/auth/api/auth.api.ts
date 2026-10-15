import { apifetch } from "../../../configs/api";
import { useApiMutation } from "../../../hooks/useApi";
import { useStore } from "../../../store/store";
import { ROUTES } from "../../../constants/routes.constants";
import { toast } from "../../../components/ui/Toast/toast.api";
import { queryClient } from "../../../lib/queryClient";
import { router } from "../../../router";
import type { logoutResponse } from "../types";

export const authMe = async () => {
  const { data } = await apifetch<{
    success: boolean;
    message: string;
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      occupation: string;
      phone?: string;
      dateOfBirth?: string;
      profilepic: string;
    };
  }>({
    method: "GET",
    path: "/auth/me",
    withCredentials: true,
    silent: true,
  });
  return data;
};

const cleanupAndRedirect = () => {
  queryClient.clear();
  useStore.getState().clearData();
  router.navigate({ to: ROUTES.LOGIN.path });
};

export const useHandleLogout = () => {
  return useApiMutation<logoutResponse, void>({
    path: "/auth/logout",
    method: "POST",
    mutationKey: ["logout_the_user"],
    options: {
      onSuccess: (res) => {
        toast.success(res.message);
        cleanupAndRedirect();
      },
      onError: () => {
        cleanupAndRedirect();
      },
    },
  });
};
