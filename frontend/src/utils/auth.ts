import { authStore } from "@/store/auth.store";
import type { AuthSnapShot, MeResponse, User } from "@/types/auth.types";
import { apiFetch, doRefresh } from "./api";
import type { QueryClient } from "@tanstack/react-query";
// TODO: point this at wherever your `me` query key actually lives
// import { meQueryKey } from "./queries";

export const AUTH_SNAPSHOT_STORAGE_KEY = "project:auth-snapshot";

export const meQueryKey = ["auth", "me"] as const;
// Currently unused anywhere in this file — see note below the code.
// function getHttpStatus(error: unknown): number | null {
//   if (
//     typeof error === "object" &&
//     error !== null &&
//     "status" in error &&
//     typeof (error as { status: unknown }).status === "number"
//   ) {
//     return (error as { status: number }).status;
//   }
//   if (axios.isAxiosError(error) && typeof error.response?.status === "number") {
//     return error.response.status;
//   }
//   return null;
// }

export function ensureMe(queryClient: QueryClient) {
  return queryClient.query({
    queryKey: meQueryKey,
    queryFn: async () => {
      const response = await apiFetch<MeResponse>("/me").then(async (res) => {
        return res?.data;
      });
      return response;
    },
    staleTime: 10_000,
  });
}

/** Drops both tokens before anything touches storage. */
function stripTokens(user: User): Omit<User, "accessToken" | "refreshToken"> {
  const { id, name, email, role, phone, dateOfBirth } = user;
  return {
    id,
    name,
    email,
    role,
    phone,
    dateOfBirth,
  };
}

/**
 * What we persist here is a UI hint only, to avoid a flash of "logged out"
 * on reload — never a credential:
 *  - accessToken lives in memory (authStore) only, and is short-lived.
 *  - refreshToken should never exist in JS at all now that it's an httpOnly
 *    cookie; the field on `User` is a leftover from a pre-cookie design.
 * Anything in localStorage is readable by any script on the page, which is
 * exactly what the httpOnly cookie is meant to be safe from.
 */
export function persistAuthSnapshotToLocalStorage(): void {
  try {
    const user = authStore.user.get();
    const snapshot: AuthSnapShot = {
      isLoggedIn: authStore.isLoggedIn.get(),
      user: user ? (stripTokens(user) as AuthSnapShot["user"]) : null,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // QuotaExceededError, private mode, etc.
  }
}

function isAuthSnapshot(value: unknown): value is AuthSnapShot {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.isLoggedIn !== "boolean") {
    return false;
  }
  if (!("savedAt" in record) || typeof record.savedAt !== "string") {
    return false;
  }
  if (!("user" in record)) {
    return false;
  }
  const userValue = record.user;
  if (userValue !== null && typeof userValue !== "object") {
    return false;
  }
  return true;
}

/**
 * Hydrates the UI hint from localStorage. This never restores a working
 * accessToken (there isn't one to restore) — pair it with `bootstrapAuth()`
 * below, which follows it with a real `doRefresh()` against the httpOnly
 * cookie.
 */
export function consumeAuthSnapshotFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(AUTH_SNAPSHOT_STORAGE_KEY);
    if (raw === null) {
      return;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isAuthSnapshot(parsed)) {
      localStorage.removeItem(AUTH_SNAPSHOT_STORAGE_KEY);
      return;
    }
    authStore.isLoggedIn.set(parsed.isLoggedIn);
    authStore.user.set(
      parsed.user === null ? null : { ...(parsed.user as User) },
    );
  } catch {
    try {
      localStorage.removeItem(AUTH_SNAPSHOT_STORAGE_KEY);
    } catch {
      // ignore
    }
    return;
  }
  try {
    localStorage.removeItem(AUTH_SNAPSHOT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasAuthCredentialsInMemory(): boolean {
  const user = authStore.user.get();
  return typeof user?.accessToken === "string" && user.accessToken.length > 0;
}

/**
 * Call once on app start, before rendering anything gated on auth.
 *
 * The httpOnly refresh cookie is the real source of truth, not localStorage.
 * We still consume the snapshot first — purely so `authStore.user` is a
 * non-null object before we call `doRefresh()`, because
 * `applyAccessTokenFromRefresh` in api.ts bails out when `current === null`.
 * If the cookie's gone or expired, `doRefresh()` fails and we drop back to
 * logged-out here.
 */
export async function bootstrapAuth(): Promise<boolean> {
  consumeAuthSnapshotFromLocalStorage();

  if (!authStore.isLoggedIn.get()) {
    return false;
  }

  const refreshed = await doRefresh();
  if (!refreshed) {
    authStore.isLoggedIn.set(false);
    authStore.user.set(null);
  }
  return refreshed;
}

export async function logout(queryClient: QueryClient) {
  // Goes through `apiFetch` -> `api`, so withCredentials + the csrf/auth
  // interceptor apply — the httpOnly refresh cookie rides along automatically.
  await apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" }).catch(
    () => {},
  );
  authStore.isLoggedIn.set(false);
  authStore.user.set(null);
  try {
    localStorage.removeItem(AUTH_SNAPSHOT_STORAGE_KEY);
  } catch {
    // ignore
  }
  await queryClient.invalidateQueries({ queryKey: meQueryKey });
}
