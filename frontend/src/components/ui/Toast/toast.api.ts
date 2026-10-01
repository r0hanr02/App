import { useStore } from "../../../store/store";
import type { MyToastContent, ToastType } from "./toast.types";

function createToast(type: ToastType, title: string, description?: string) {
  const toastContent: MyToastContent = {
    id: crypto.randomUUID(),
    title,
    description,
    type,
    timeout: 3000,
    visible: true,
  };

  useStore.getState().addToast(toastContent);

  setTimeout(() => {
    toast.dismiss(toastContent.id);
  }, toastContent.timeout);
}

export const toast = {
  success(title: string, description?: string) {
    createToast("success", title, description);
  },

  error(title: string, description?: string) {
    createToast("error", title, description);
  },

  warning(title: string, description?: string) {
    createToast("warning", title, description);
  },

  info(title: string, description?: string) {
    createToast("info", title, description);
  },

  dismiss(id: string) {
    useStore.getState().dismissToast(id);
  },

  clear() {
    useStore.getState().clearToasts();
  },
};
