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
import { userOrganizationQueryOptions } from "../features/home/api/home.api";

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

function RoutePending() {
  return (
    <div className="root-layout-loading">
      <Loader2 className="lucide lucide-loader-2" />
    </div>
  );
}

export function createAppRoutes(rootRoute: AnyRootRoute) {
  return (Object.keys(ROUTES) as AppRouteKey[]).map((key) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: ROUTES[key].path,
      component: withSuspense(COMPONENTS[key]),
      pendingComponent: RoutePending,
      pendingMs: 150,
      pendingMinMs: 300,

      beforeLoad: async ({ context }) => {
        if (ROUTES[key].requiresAuth && !context.auth.isLoggedIn) {
          throw redirect({ to: ROUTES.LOGIN.path });
        }

        if (key === "LOGIN" || key === "REGISTER") {
          return;
        }

        if (!ROUTES[key].requiresAuth || !ROUTES[key].requireOrg) {
          if (key === "NOORGANIZATION" && context.auth.isLoggedIn) {
            let orgs: unknown[] = [];
            try {
              const res = await context.queryClient.ensureQueryData(
                userOrganizationQueryOptions,
              );
              orgs = res.data ?? [];
            } catch {
              return;
            }
            if (orgs.length > 0) {
              throw redirect({ to: ROUTES.HOME.path });
            }
          }
          return;
        }
        let orgs: unknown[] = [];
        try {
          const res = await context.queryClient.ensureQueryData(
            userOrganizationQueryOptions,
          );
          orgs = res.data ?? [];
        } catch {
          return;
        }

        if (orgs.length === 0) {
          throw redirect({
            to: ROUTES.NOORGANIZATION.path,
          });
        }
      },
    }),
  );
}
