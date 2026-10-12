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

export function createAppRoutes(rootRoute: AnyRootRoute) {
  return (Object.keys(ROUTES) as AppRouteKey[]).map((key) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: ROUTES[key].path,
      component: withSuspense(COMPONENTS[key]),
      beforeLoad: async ({ context }) => {
        if (ROUTES[key].requiresAuth && !context.auth.isLoggedIn) {
          throw redirect({ to: ROUTES.LOGIN.path });
        }
        if (key === "NOORGANIZATION") {
          const organization = await context.queryClient.ensureQueryData(
            userOrganizationQueryOptions,
          );
          if (organization.data.data.length !== 0) {
            throw redirect({ to: ROUTES.HOME.path });
          }
        }
      },
    }),
  );
}
