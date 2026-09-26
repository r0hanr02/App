import type { ApiError } from "@/utils/api";
import type {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiErrorBody = {
  message?: string;
} & Record<string, unknown>;

export type RefreshResponseBody = {
  data?: {
    message: string;
    accessToken?: string;
  };
};

export interface ApiQueryOptions<TData> extends Omit<
  UseQueryOptions<TData>,
  "queryKey" | "queryFn"
> {
  headers?: Record<string, string>;
}

export interface ApiMutationOptions<TData, TVariables> extends Omit<
  UseMutationOptions<TData, ApiError, TVariables>,
  "mutationFn"
> {
  method?: HttpMethod;
  invalidateKeys?: QueryKey[];
  headers?: Record<string, string>;
  body?: (variables: TVariables) => unknown;
  onOptimisticUpdate?: (variables: TVariables) => void;
  onRollback?: (variables: TVariables, snapshot: unknown) => void;
}
