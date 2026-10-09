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

function validateOrgSearch(search: Record<string, unknown>): {
  orgId?: string;
} {
  const orgId = search.orgId;
  return {
    orgId:
      typeof orgId === "string" && orgId.length > 0 ? orgId : undefined,
  };
}

export function createAppRoutes(rootRoute: AnyRootRoute) {
  return (Object.keys(ROUTES) as AppRouteKey[]).map((key) =>
    createRoute({
      getParentRoute: () => rootRoute,
      // Same routing — paths unchanged. Active org travels as `?orgId=`.
      path: ROUTES[key].path,
      validateSearch: validateOrgSearch,
      component: withSuspense(COMPONENTS[key]),
      beforeLoad: ({ context }) => {
        if (ROUTES[key].requiresAuth && !context.auth.isLoggedIn) {
          throw redirect({ to: ROUTES.LOGIN.path });
        }
      },
    }),
  );
}
