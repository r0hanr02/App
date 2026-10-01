import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  type MutationKey,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apifetch } from "../configs/api";
import type { configOptions } from "../types/api.types";

type HttpMethod = configOptions["method"] | "DELETE";

interface UseApiQueryProps<TData> {
  queryKey: QueryKey;
  path: string;
  method?: HttpMethod;
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">;
}

interface UseApiMutationProps<TData, TVariables> {
  mutationKey?: MutationKey;
  path: string;
  method?: HttpMethod;
  options?: Omit<
    UseMutationOptions<TData, Error, TVariables>,
    "mutationFn" | "mutationKey"
  >;
}

export function useApiQuery<TData>({
  queryKey,
  path,
  method = "GET",
  options,
}: UseApiQueryProps<TData>) {
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apifetch<TData>({ path, method });
      return response.data;
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });

  const state = useMemo(
    () => ({
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      errorMessage: (query.error?.message ?? null) as string | null,
    }),
    [query.isLoading, query.isFetching, query.isError, query.error],
  );

  return {
    ...query,
    state,
  };
}

export function useApiMutation<TData, TVariables = unknown>({
  mutationKey,
  path,
  method = "POST",
  options,
}: UseApiMutationProps<TData, TVariables>) {
  const mutation = useMutation<TData, Error, TVariables>({
    mutationKey,
    mutationFn: async (payload) => {
      const response = await apifetch<TData>({
        path,
        method,
        data: payload,
      });
      return response.data;
    },
    ...options,
  });

  const state = useMemo(
    () => ({
      isPending: mutation.isPending,
      isSuccess: mutation.isSuccess,
      isError: mutation.isError,
      errorMessage: (mutation.error?.message ?? null) as string | null,
    }),
    [mutation.isPending, mutation.isSuccess, mutation.isError, mutation.error],
  );

  return {
    ...mutation,
    state,
  };
}
