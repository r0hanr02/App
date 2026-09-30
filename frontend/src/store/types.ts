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
  data: unknown;
  setData: (value: ApiData) => void;
  logOut: () => void;
};

export type ToastType = "success" | "error" | "info" | "warning";

export interface MyToastContent {
    id: string;
    title?: string;
    description?: string;
    type: ToastType;
    children?: React.ReactNode;
    // state?: "entering" | "visible" | "leaving";
    visible: boolean;
    showClose?: boolean;
    timeout?: number;
  }