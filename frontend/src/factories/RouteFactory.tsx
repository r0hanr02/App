import {
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from "react";
import {
  createRoute,
  redirect,
  type AnyRootRoute,
} from "@tanstack/react-router";
import { ROUTES, type AppRouteKey } from "../constants/routes.constants";
import { COMPONENTS } from "./ComponentFactory";
import { Loader2 } from "lucide-react";

type RouteMeta = {
  /** When true, beforeLoad redirects logged-out users to LOGIN */
  requiresAuth: boolean;
};

// One entry per AppRouteKey. New feature route = one line here.
const ROUTE_META: Record<AppRouteKey, RouteMeta> = {
  HOME: { requiresAuth: true },
  LOGIN: { requiresAuth: false },
  REGISTER: { requiresAuth: false },
  NOORGANIZATION: { requiresAuth: true },
  DASHBOARD: { requiresAuth: true },
};

function withSuspense(
  Component: LazyExoticComponent<ComponentType<object>>,
): () => ReactNode {
  return function LazyWrapper() {
    const C = Component;
    return (
      <Suspense
        fallback={
          <div className="root-layout-loading">
            <Loader2 className="lucide lucide-loader-2" />
          </div>
        }
      >
        <C />
      </Suspense>
    );
  };
}

export function createAppRoutes(rootRoute: AnyRootRoute) {
  return (Object.keys(ROUTES) as AppRouteKey[]).map((key) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: ROUTES[key],
      component: withSuspense(COMPONENTS[key]),
      beforeLoad: ({ context }) => {
        if (ROUTE_META[key].requiresAuth && !context.auth.isLoggedIn) {
          throw redirect({ to: ROUTES.LOGIN });
        }
      },
    }),
  );
}
