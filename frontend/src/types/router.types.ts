import type { QueryClient } from "@tanstack/react-query";
import type { UserType } from "../store/types";

export interface AuthContextValue {
  isLoggedIn: boolean;
  user: UserType | null;
}

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthContextValue;
}
