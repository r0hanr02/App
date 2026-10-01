import type { StateCreator } from "zustand";
import type { AuthStoreType, RootStore } from "./types";

export const useAuthStoreSlice: StateCreator<
  RootStore,
  [],
  [],
  AuthStoreType
> = (set) => ({
  isLoggedIn: false,
  data: null,
  setData: (value) => set({ data: value, isLoggedIn: true }),
  clearData: () => set({ data: null, isLoggedIn: false }),
});
