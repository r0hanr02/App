import { useCallback, useEffect, useMemo } from "react";
import {
  useLocation,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useStore } from "../store/store";
import { useGetUserOrganization } from "../features/home/api/home.api";
import {
  getOrgIdFromSearch,
  withOrgSearch,
} from "../lib/orgParams";
import { ROUTES } from "../constants/routes.constants";

const KNOWN_PATHS = new Set<string>(
  Object.values(ROUTES).map((r) => r.path as string),
);

/**
 * Single source of truth for "whichever org is active".
 *
 * Priority:
 *  1. `?orgId=` in the URL (if it belongs to the user)
 *  2. persisted `activeOrgId` in the store (if it still belongs to the user)
 *  3. first organization in the list
 *
 * Same routing is preserved — only the search param changes.
 */
export function useActiveOrg() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading } = useGetUserOrganization();

  const storedOrgId = useStore((s) => s.activeOrgId);
  const setStoredOrgId = useStore((s) => s.setActiveOrgId);

  const organizations = useMemo(() => data?.data ?? [], [data]);

  const urlOrgId = getOrgIdFromSearch(search);

  const activeOrg = useMemo(() => {
    if (organizations.length === 0) return null;
    if (urlOrgId) {
      const match = organizations.find(
        (o) => o.organization_id?._id === urlOrgId,
      );
      if (match) return match;
    }
    if (storedOrgId) {
      const match = organizations.find(
        (o) => o.organization_id?._id === storedOrgId,
      );
      if (match) return match;
    }
    return organizations[0] ?? null;
  }, [organizations, urlOrgId, storedOrgId]);

  const activeOrgId = activeOrg?.organization_id?._id ?? null;

  // Keep persisted value in sync with resolved active org.
  useEffect(() => {
    if (activeOrgId && activeOrgId !== storedOrgId) {
      setStoredOrgId(activeOrgId);
    }
    if (organizations.length === 0 && storedOrgId) {
      setStoredOrgId(null);
    }
  }, [activeOrgId, storedOrgId, organizations.length, setStoredOrgId]);

  // If URL has no (or a stale) orgId but we resolved one, inject it
  // with `replace` so refresh/share keeps the same org. Same path, just params.
  useEffect(() => {
    if (isLoading) return;
    if (!activeOrgId) return;
    if (urlOrgId === activeOrgId) return;
    // Unknown path (true 404) — don't fight the router, let NotFound render.
    if (!KNOWN_PATHS.has(location.pathname)) return;
    // Don't force params on auth-only pages without org context.
    if (
      location.pathname === "/login" ||
      location.pathname === "/register" ||
      location.pathname === "/onboarding" ||
      location.pathname === "/no-organization"
    ) {
      return;
    }
    navigate({
      // @ts-expect-error — same route, only search changes
      search: (prev: Record<string, unknown>) =>
        withOrgSearch(activeOrgId, prev),
      replace: true,
    }).catch((err) => {
      console.warn("Failed to sync org search param:", err);
    });
  }, [isLoading, activeOrgId, urlOrgId, location.pathname, navigate]);

  const switchOrg = useCallback(
    (nextOrgId: string) => {
      setStoredOrgId(nextOrgId);
      navigate({
        // @ts-expect-error — same route, only search changes
        search: (prev: Record<string, unknown>) =>
          withOrgSearch(nextOrgId, prev),
        replace: false,
      }).catch((err) => {
        console.warn("Failed to switch workspace:", err);
      });
    },
    [navigate, setStoredOrgId],
  );

  /** Navigate to any path while preserving / setting the active org param. */
  const navigateWithOrg = useCallback(
    (to: string, orgId?: string | null) => {
      const id = orgId ?? activeOrgId;
      navigate({
        to,
        search: withOrgSearch(id),
      }).catch((err) => {
        console.warn(`Navigation to ${to} failed:`, err);
      });
    },
    [navigate, activeOrgId],
  );

  return {
    organizations,
    activeOrg,
    activeOrgId,
    isLoading,
    switchOrg,
    navigateWithOrg,
  };
}

/** Lightweight accessor when you only need the id (no side effects). */
export function useActiveOrgId(): string | null {
  const search = useSearch({ strict: false });
  const storedOrgId = useStore((s) => s.activeOrgId);
  return getOrgIdFromSearch(search) ?? storedOrgId;
}
