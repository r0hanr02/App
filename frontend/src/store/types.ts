export type ApiData = {
  success: true;
  message: string;
  accessToken: string;
  user: UserType;
};

export type UserType = {
  id: string;
  name: string;
  email: string;
  profilepic: string;
};

export type AuthStoreType = {
  isLoggedIn: boolean;
  data: ApiData | null;
  setData: (value: ApiData) => void;
  clearData: () => void;
};

export type Theme = "light" | "dark";

export type ThemeStoreSlice = {
  theme: Theme;
  isSystem: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setSystemTheme: () => void;
};

export type ToastType = "success" | "error" | "info" | "warning";

export interface MyToastContent {
  id: string;
  title?: string;
  description?: string;
  type: ToastType;
  children?: React.ReactNode;
  visible: boolean;
  showClose?: boolean;
  timeout?: number;
}

export type ToastStoreSlice = {
  toasts: MyToastContent[];
  addToast: (toast: MyToastContent) => void;
  removeToast: (id: string) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
};

export type RootStore = AuthStoreType & ThemeStoreSlice & ToastStoreSlice;