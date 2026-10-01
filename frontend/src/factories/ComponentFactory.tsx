import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { AppRouteKey } from "../constants/routes.constants";

export type ComponentMap = Record<string, LazyExoticComponent<any>>;
export type LazyPage = LazyExoticComponent<ComponentType<object>>;

export const COMPONENTS: Record<AppRouteKey, LazyPage> = {
  LOGIN: lazy(() => import("../features/auth/pages/Login/Login")),
  REGISTER: lazy(() => import("../features/auth/pages/Register/Register")),
};
