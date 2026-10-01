import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useStore } from "../store/store";
import { axiosInstance, refreshInstance } from "./api";

type errorAxios = InternalAxiosRequestConfig & { _retry: boolean | undefined };

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useStore.getState().data?.accessToken;
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.log(error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: errorAxios }) => {
    const originalRequest = error.config as errorAxios | undefined;

    if (originalRequest?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await refreshInstance.post("/auth/refresh");

        const newAccessToken = res.data.accessToken;

        // Update the access token in your store or wherever you keep it
        const currentUserData = useStore.getState().data;
        if (currentUserData) {
          useStore.getState().setData({
            ...currentUserData,
            accessToken: newAccessToken,
          });
        }

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        useStore.getState().clearData();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
