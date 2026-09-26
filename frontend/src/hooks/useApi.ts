import type { ApiMutationOptions, ApiQueryOptions } from "@/types/api.types";
import { ApiError, apiFetch } from "@/utils/api";
import { batch } from "@legendapp/state";
import { useObservable, useObserve } from "@legendapp/state/react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

// ─── useApiQuery ──────────────────────────────────────────────────────────────

/**
 * Fetches server data via TanStack Query and syncs status into a
 * per-call Legend State observable — so any component can reactively
 * observe loading/error without extra props or context.
 *
 * @example
 * const { data, state$ } = useApiQuery<UserListResponse>(
 *   ["users", page],
 *   `users/?page=${page}&limit=20`
 * );
 * const isLoading = useValue(state$.isLoading); // reactive, no re-render overhead
 */


export function useApiQuery<TData>(
  queryKey: QueryKey,
  path: string,
  options?: ApiQueryOptions<TData>,
) {
  const { headers, ...queryOptions } = options ?? {};

  // Scoped observable — one per hook call, not shared globally.
  // Child components can Subscribe to individual fields.
  const state$ = useObservable({
    isLoading: true,
    isError: false,
    isFetching: false,
    errorMessage: null as string | null,
  });

  const query = useQuery({
    queryKey,
    queryFn: () => apiFetch<TData>(path, { headers }),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

  // Mirror TanStack Query status into Legend State.
  // batch() groups all four writes into one notification burst.
  useObserve(() => {
    batch(() => {
      state$.isLoading.set(query.isLoading);
      state$.isFetching.set(query.isFetching);
      state$.isError.set(query.isError);
      state$.errorMessage.set(query.error?.message ?? null);
    });
  }, [query.isLoading, query.isFetching, query.isError, query.error?.message]);

  return {
    ...query,
    state$, // hand back the observable — caller decides what to observe
  };
}

// ─── useApiMutation ───────────────────────────────────────────────────────────

/**
 * Mutation hook with:
 * - Legend State observable for reactive status tracking
 * - Optimistic update support (update UI before server responds)
 * - Automatic rollback on failure
 * - Query invalidation on success
 *
 * @example — optimistic delete
 * const { mutate } = useApiMutation<void, { id: string }>(
 *   (vars) => `users/${vars.id}`,
 *   {
 *     method: "DELETE",
 *     invalidateKeys: [["users"]],
 *     onOptimisticUpdate: (vars) => {
 *       userState$.userData.set((prev) => prev.filter((u) => u.id !== vars.id));
 *     },
 *     onRollback: (_vars, snapshot) => {
 *       userState$.userData.set(snapshot as UserListItem[]);
 *     },
 *   }
 * );
 */


export function useApiMutation<TData, TVariables = void>(
  path: string | ((variables: TVariables) => string),
  options?: ApiMutationOptions<TData, TVariables>,
) {
  const queryClient = useQueryClient();
  const {
    method = "POST",
    invalidateKeys = [],
    headers,
    body: bodyFromVariables,
    onOptimisticUpdate,
    onRollback,
    onSuccess,
    onError,
    ...mutationOptions
  } = options ?? {};

  // Per-mutation observable — reactive status for any observing component
  const mutationState$ = useObservable({
    isPending: false,
    isSuccess: false,
    isError: false,
    errorMessage: null as string | null,
  });

  const mutation = useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables) => {
      const resolvedPath = typeof path === "function" ? path(variables) : path;
      const body = bodyFromVariables
        ? bodyFromVariables(variables)
        : ((variables as unknown) ?? undefined);
      return apiFetch<TData>(resolvedPath, {
        method,
        body,
        headers,
      });
    },

    onMutate: async (variables) => {
      mutationState$.isPending.set(true);

      // Cancel in-flight fetches to prevent stale data overwriting optimistic UI
      if (invalidateKeys.length > 0) {
        await Promise.all(
          invalidateKeys.map((key) =>
            queryClient.cancelQueries({ queryKey: key }),
          ),
        );
      }

      // Snapshot TanStack Query cache for rollback
      const snapshots = invalidateKeys.map((key) => ({
        key,
        data: queryClient.getQueryData(key),
      }));

      // Apply optimistic Legend State update immediately
      onOptimisticUpdate?.(variables);

      return { snapshots, variables };
    },

    onSuccess: async (data, variables, onMutateResult, context) => {
      batch(() => {
        mutationState$.isPending.set(false);
        mutationState$.isSuccess.set(true);
        mutationState$.isError.set(false);
        mutationState$.errorMessage.set(null);
      });

      if (invalidateKeys.length > 0) {
        await Promise.all(
          invalidateKeys.map((key) =>
            queryClient.invalidateQueries({ queryKey: key }),
          ),
        );
      }

      onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      batch(() => {
        mutationState$.isPending.set(false);
        mutationState$.isSuccess.set(false);
        mutationState$.isError.set(true);
        mutationState$.errorMessage.set(
          error.message ?? "Something went wrong",
        );
      });

      // Rollback TanStack Query cache to pre-mutation snapshot
      if (context) {
        const { snapshots } = context as unknown as {
          snapshots: { key: QueryKey; data: unknown }[];
        };
        snapshots.forEach(({ key, data }) =>
          queryClient.setQueryData(key, data),
        );
      }

      // Rollback Legend State to pre-mutation snapshot
      onRollback?.(variables, context);

      onError?.(error, variables, onMutateResult, context);
    },

    onSettled: () => {
      mutationState$.isPending.set(false);
    },

    ...mutationOptions,
  });

  return {
    ...mutation,
    mutationState$,
  };
}
