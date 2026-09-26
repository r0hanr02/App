import { router } from "@/router";
import { authStore } from "@/store/auth.store";
import type {
  ApiErrorBody,
  HttpMethod,
  RefreshResponseBody,
} from "@/types/api.types";
import { batch } from "@legendapp/state";
import axios, { type AxiosResponse } from "axios";

export const HOST: string = window.location.hostname;
export const PORT: string = window.location.port;

function resolveApiOrigin(): string {
  const configured = (
    import.meta.env.VITE_API_BASE_URL as string | undefined
  )?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  const portPart = PORT ? `${PORT}` : "";
  return `${window.location.protocol}//${HOST}${portPart}`;
}

export const API_ORIGIN: string = resolveApiOrigin();
export const API_URL: string = `${API_ORIGIN}/api/v1/`;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  validateStatus: () => true,
});

api.interceptors.request.use((config) => {
  const csrf = getCookie("csrf_token");
  if (csrf) {
    config.headers.set("x-csrf-token", csrf);
  }
  const token = authStore.user?.get()?.accessToken;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

export class ApiError extends Error {
  readonly status: number;
  readonly data: ApiErrorBody;

  constructor(status: number, data: unknown) {
    const body: ApiErrorBody =
      typeof data === "object" && data !== null
        ? (data as ApiErrorBody)
        : { message: typeof data === "string" ? data : undefined };
    super(body.message ?? `API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = body;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function buildHeaders(
  headers: Record<string, string> = {},
  body?: unknown,
): Record<string, string> {
  if (body instanceof FormData) {
    // let the browser set its own multipart boundary
    return { ...headers };
  }
  return {
    "Content-Type": "application/json",
    ...headers,
  };
}

function applyAccessTokenFromRefresh(body: RefreshResponseBody): boolean {
  const accessToken = body?.data?.accessToken;

  if (typeof accessToken !== "string" || accessToken.length === 0) {
    return false;
  }

  const current = authStore.user.get();
  if (current === null) {
    return false;
  }
  authStore.user.set({
    ...current,
    accessToken,
  });

  return true;
}

export async function doRefresh(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    // goes through `api`, so withCredentials + the csrf/auth interceptor apply here too
    const res = await api.post("/refresh", null);
    if (res.status < 200 || res.status >= 300) {
      return false;
    }
    return applyAccessTokenFromRefresh(res.data as RefreshResponseBody);
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const method = options.method ?? "GET";

  const makeRequest = () =>
    api.request({
      // absolute URLs pass through as-is; axios ignores baseURL when url is absolute
      url: path.includes("http") ? path : `${API_URL}${path}`,
      method,
      headers: buildHeaders(options.headers, options.body),
      data: method === "GET" ? undefined : options.body,
    });

  let res: AxiosResponse;
  try {
    res = await makeRequest();
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Network Error") {
      router.navigate({
        to: "/maintenance",
        search: { reason: "network_error" },
      });
    }

    throw error;
  }

  if (res.status !== 401) {
    if (res.status < 200 || res.status >= 300) {
      if (res.status === 500) {
        router.navigate({
          to: "/maintenance",
          search: { reason: "network_error" },
        });
      }
      throw new ApiError(res.status, res.data);
    }
    return res.data as T;
  }

  const refreshed = await doRefresh();
  if (!refreshed) {
    batch(() => {
      authStore.isLoggedIn.set(false);
      authStore.user.set(null);
    });
    window.location.href = "/login?reason=session_expired";
    throw new ApiError(401, { message: "Unauthorized: refresh failed" });
  }

  const retry = await makeRequest();

  if (retry.status < 200 || retry.status >= 300) {
    throw new ApiError(retry.status, retry.data);
  }
  return retry.data as T;
}
