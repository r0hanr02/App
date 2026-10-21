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
import {
  userOrganizationQueryOptions,
  type UserOrgMembership,
} from "../features/home/api/home.api";

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
export function getRoutePath(key: AppRouteKey): string {
  const route = ROUTES[key];

  if (!route.orgScoped) {
    return route.path;
  }
  return route.path === "/" ? "/$orgSlug" : `/$orgSlug${route.path}`;
}

export function createAppRoutes(rootRoute: AnyRootRoute) {
  return (Object.keys(ROUTES) as AppRouteKey[]).map((key) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: getRoutePath(key),
      component: withSuspense(COMPONENTS[key]),
      pendingComponent: RoutePending,
      pendingMs: 150,
      pendingMinMs: 300,

      beforeLoad: async ({ context, params }) => {
        const routeDef = ROUTES[key];

        if (key === "LOGIN" || key === "REGISTER" || key === "FORGETPASSWORD") {
          return;
        }

        if (routeDef.requiresAuth && !context.auth.isLoggedIn) {
          console.log("redirecttting");
          throw redirect({ to: ROUTES.LOGIN.path as never });
        }

        const needsOrgs =
          routeDef.requireOrg || routeDef.orgScoped || key === "NOORGANIZATION";
        let orgs: UserOrgMembership[] = [];
        if (needsOrgs) {
          try {
            const res = await context.queryClient.ensureQueryData(
              userOrganizationQueryOptions,
            );
            orgs = Array.isArray(res.data) ? res.data : [];
          } catch {
            return;
          }
        }

        if (!routeDef.requiresAuth || !routeDef.requireOrg) {
          if (key === "NOORGANIZATION" && context.auth.isLoggedIn) {
            if (orgs.length > 0) {
              const firstSlug = orgs[0]?.organization_id?.slug;
              if (firstSlug) {
                throw redirect({
                  to: "/$orgSlug" as never,
                  params: { orgSlug: firstSlug } as never,
                });
              }
            }
          }
          return;
        }

        if (orgs.length === 0) {
          throw redirect({
            to: ROUTES.NOORGANIZATION.path as never,
          });
        }

        // Validate the `$orgSlug` URL segment against the user's memberships.
        if (routeDef.orgScoped) {
          const orgSlug = (params as Record<string, unknown>).orgSlug as
            string | undefined;
          const validSlugs = new Set(
            orgs
              .map((o) => o.organization_id?.slug)
              .filter((s): s is string => Boolean(s)),
          );
          if (!orgSlug || !validSlugs.has(orgSlug)) {
            const fallback = orgs[0]?.organization_id?.slug;
            if (fallback && fallback !== orgSlug) {
              throw redirect({
                to: getRoutePath(key) as never,
                params: { orgSlug: fallback } as never,
              });
            }
          }
        }
      },
    }),
  );
}
