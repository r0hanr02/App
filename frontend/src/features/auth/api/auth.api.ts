import { apifetch } from "../../../configs/api";
import { useApiMutation } from "../../../hooks/useApi";
import { useStore } from "../../../store/store";
import { ROUTES } from "../../../constants/routes.constants";
import { toast } from "../../../components/ui/Toast/toast.api";
import { queryClient } from "../../../lib/queryClient";
import { router } from "../../../router";

export const authMe = async () => {
  const { data } = await apifetch<{
    success: boolean;
    message: string;
    accessToken: string;
    user: { id: string; name: string; email: string; profilepic: string };
  }>({
    method: "GET",
    path: "/auth/me",
    withCredentials: true,
    silent: true,
  });
  return data;
};

type logoutResponse = { success: boolean; message: string };

const cleanupAndRedirect = () => {
  queryClient.clear();
  useStore.getState().clearData();
  router.navigate({ to: ROUTES.LOGIN });
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
