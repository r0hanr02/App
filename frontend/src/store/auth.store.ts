import type { StateCreator } from "zustand";
import type { AuthStoreType } from "./types";

export const useAuthStoreSlice: StateCreator<AuthStoreType> = (set) => ({
  isLoggedIn: false,
  data: null,
  setData: (value) => set({ data: value, isLoggedIn: true }),
  logOut: () => set({ data: null, isLoggedIn: false }),
});
