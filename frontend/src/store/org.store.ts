import type { StateCreator } from "zustand";
import type { OrgStoreSlice, RootStore } from "./types";

export const useOrgStoreSlice: StateCreator<RootStore, [], [], OrgStoreSlice> = (
  set,
) => ({
  activeOrgId: null,
  setActiveOrgId: (orgId) => set({ activeOrgId: orgId }),
});
