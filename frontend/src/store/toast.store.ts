import type { StateCreator } from "zustand";
import type { MyToastContent } from "./types";

type toastStoreSlice = {
  toasts: MyToastContent[];
};
export const useToastStoreSlice: StateCreator<toastStoreSlice> = () => ({
  toasts: [],
});
