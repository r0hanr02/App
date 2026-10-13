import { useEffect, useMemo } from "react";
import { useGetUserOrganization } from "../features/home/api/home.api";
import { useStore } from "../store/store";

export function useActiveOrg() {
  const { data, isLoading } = useGetUserOrganization();

  const orgs = useMemo(() => data?.data ?? [], [data]);
  const storedOrgId = useStore((s) => s.activeOrgId);
  const setStoredOrgId = useStore((s) => s.setActiveOrgId);

  const activeOrg = useMemo(
    () =>
      orgs.find((o) => o.organization_id._id === storedOrgId) ??
      orgs[0] ??
      null,
    [orgs, storedOrgId],
  );
  const activeOrgId = activeOrg?.organization_id._id ?? null;
  
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
    activeOrgId,
    storedOrgId,
    isLoading,
  };
}
