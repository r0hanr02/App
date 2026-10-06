import axios, { type AxiosResponse } from "axios";
import type { configOptions } from "../types/api.types";
import { toast } from "../components/ui/Toast/toast.api";

const baseURL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  withCredentials: true,
});

export const refreshInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
  withCredentials: true,
});

export const apifetch = async <TData>(
  configOptions: configOptions,
): Promise<AxiosResponse<TData>> => {
  try {
    const isFormData = configOptions.data instanceof FormData;
    const response: AxiosResponse = await axiosInstance({
      url: configOptions.path,
      method: configOptions.method,
      data: configOptions.data,
      withCredentials: configOptions.withCredentials ?? true,
      headers: {
        ...(isFormData ? {} : { "Content-type": "application/json" }),
        ...configOptions.headers,
      },
    });
    return response;
  } catch (error) {
    if (!configOptions.silent) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        toast.error(message);
      }
    }
    throw error;
  }
};

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
