import { useEffect, useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { useGetUserOrganization } from "../features/home/api/home.api";
import { useStore } from "../store/store";

export function useActiveOrg() {
  const { data, isLoading } = useGetUserOrganization();
  // URL slug wins (HOME is "/$orgSlug") — falls back to stored/first org.
  const params = useParams({ strict: false }) as { orgSlug?: string };
  const urlSlug = params?.orgSlug;

  const orgs = useMemo(() => data?.data ?? [], [data]);
  const storedOrgId = useStore((s) => s.activeOrgId);
  const setStoredOrgId = useStore((s) => s.setActiveOrgId);

  const activeOrg = useMemo(
    () =>
      (urlSlug
        ? orgs.find((o) => o.organization_id?.slug === urlSlug)
        : undefined) ??
      orgs.find((o) => o.organization_id._id === storedOrgId) ??
      orgs[0] ??
      null,
    [orgs, storedOrgId, urlSlug],
  );
  const activeOrgId = activeOrg?.organization_id._id ?? null;
  const activeOrgSlug = activeOrg?.organization_id?.slug ?? urlSlug ?? null;
  useEffect(() => {
    if (activeOrgId && activeOrgId !== storedOrgId) {
      setStoredOrgId(activeOrgId);
    }
    if (orgs.length === 0 && storedOrgId) {
      setStoredOrgId(null);
    }
  }, [activeOrgId, storedOrgId, orgs.length, setStoredOrgId]);

  return {
    orgs,
    activeOrg,
    activeOrgSlug,
    activeOrgId,
    storedOrgId,
    isLoading,
  };
}
