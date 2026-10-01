import { Suspense, type ComponentType, type LazyExoticComponent, type ReactNode } from "react";
import {
  createRoute,
  redirect,
  type AnyRootRoute,
} from "@tanstack/react-router";
import { ROUTES, type AppRouteKey } from "../constants/routes.constants";
import { COMPONENTS } from "./ComponentFactory";

type RouteMeta = {
  /** When true, beforeLoad redirects logged-out users to LOGIN */
  requiresAuth: boolean;
};

// One entry per AppRouteKey. New feature route = one line here.
const ROUTE_META: Record<AppRouteKey, RouteMeta> = {
  LOGIN: { requiresAuth: false },
  REGISTER: { requiresAuth: false },
  // e.g. DASHBOARD: { requiresAuth: true },
};

function withSuspense(
  Component: LazyExoticComponent<ComponentType<object>>,
): () => ReactNode {
  return function LazyWrapper() {
    const C = Component;
    return (
      <Suspense fallback={<div>Loading...</div>}>
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
        if (
          ROUTE_META[key].requiresAuth &&
          !context.auth.isLoggedIn
        ) {
          throw redirect({ to: ROUTES.LOGIN });
        }
      },
    }),
  );
}
