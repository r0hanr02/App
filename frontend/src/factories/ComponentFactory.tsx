import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { AppRouteKey } from "../constants/routes.constants";

export type ComponentMap = Record<string, LazyExoticComponent<any>>;
export type LazyPage = LazyExoticComponent<ComponentType<object>>;

export const COMPONENTS: Record<AppRouteKey, LazyPage> = {
  HOME: lazy(() => import("../features/home/pages/home/Home")),
  LOGIN: lazy(() => import("../features/auth/pages/Login/Login")),
  REGISTER: lazy(() => import("../features/auth/pages/Register/Register")),
  NOORGANIZATION: lazy(
    () => import("../features/home/pages/noorganization/NoOrganization"),
  ),
  ONBOARDING: lazy(
    () => import("../features/home/pages/onboarding/Onboarding"),
  ),
  PROFILE: lazy(() => import("../features/auth/components/Profile/Profile")),
  // Pages not built yet render the shared NotFound page inside the layout.
  PROJECTS: lazy(() => import("../components/NotFound/NotFound")),
  TASKS: lazy(() => import("../components/NotFound/NotFound")),
  USERS: lazy(() => import("../components/NotFound/NotFound")),
  ORGANIZATION: lazy(
    () => import("../features/organization/pages/Organization/Organization"),
  ),
  NOTIFICATION: lazy(() => import("../components/NotFound/NotFound")),
  SETTINGS: lazy(() => import("../features/settings/pages/Settings/Settings")),
  // DASHBOARD:lazy(()=>import("../features/home/pages/dashboard/Dashboard"))

  // settings page component
};
