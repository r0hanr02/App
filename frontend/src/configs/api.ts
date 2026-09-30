import axios, { type AxiosResponse } from "axios";
import type { configOptions } from "../types/api.types";

const baseURL = "http://localhost/api/v1";

export const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
});

export const refreshInstance = axios.create({
  baseURL: baseURL,
  timeout: 5000,
});

export const apifetch = async <TData>(
  configOptions: configOptions,
): Promise<AxiosResponse<TData>> => {
  const response: AxiosResponse = await axiosInstance({
    url: configOptions.path,
    method: configOptions.method,
    data: configOptions.data,
    headers: {
      "Content-type": "application/json",
      ...configOptions.headers,
    },
  });
  return response;
};
