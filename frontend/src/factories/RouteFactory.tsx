import RouteNotFound from "@/components/RouteNotFound";
import AuthLayout from "@/pages/Auth";
import RootLayout from "@/pages/Layouts";
import { authStore } from "@/store/auth.store";
import type {
  Role,
  RouteConfig,
  RouterContext,
  SearchParamConfig,
} from "@/types/routes.types";
import { canAccess } from "@/utils/rbac";
import {
  createRootRouteWithContext,
  Outlet,
  createRoute,
  redirect,
} from "@tanstack/react-router";
import { ComponentFactory } from "./ComponentFactory";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  notFoundComponent: () => <RouteNotFound />,
});

export const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: () => <AuthLayout />,
  loader: ({ context }) => {
    return {
      isLoggedIn: context.isLoggedIn,
      user: context.user,
    };
  },
  beforeLoad: ({ context }) => {
    if (context.isLoggedIn) {
      throw redirect({ to: "/" });
    }
  },
});

export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: () => <RootLayout />,
  loader: ({ context }) => {
    return {
      isLoggedIn: context.isLoggedIn,
      user: context.user,
    };
  },
  beforeLoad: ({ location }) => {
    if (!authStore.isLoggedIn.get()) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

export const getRoleGuard = (allowedRoles?: Role[]) => {
  if (!allowedRoles) return undefined;
  return () => {
    const roles = (authStore.user.role.get() ?? []) as Role[];
    if (!canAccess(roles, allowedRoles)) {
      throw redirect({ to: "/" });
    }
  };
};

export const buildValidateSearch = (searchConfig?: SearchParamConfig) => {
  if (!searchConfig) return undefined;

  return (raw: Record<string, unknown>) => {
    const result: Record<string, string> = {};

    for (const param of searchConfig.params) {
      const value = raw[param];

      if (typeof value === "string" && value.length > 0) {
        result[param] = value;
      } else if (searchConfig.defaults?.[param]) {
        result[param] = searchConfig.defaults[param];
      }
    }
    return result;
  };
};

export const makePage = (Page: ReturnType<typeof ComponentFactory.get>) => {
  return () => (
    <Suspense
      fallback={
        <div className="flex items-center justify-center ">
          <LoaderCircle className="animate-spin" size={32} />
        </div>
      }
    >
      <Page />
    </Suspense>
  );
};

export const buildRouteTree = (routes: RouteConfig[]) => {
  const authRoutes = routes.filter((r) => r.layout === "auth");
  const appRoutes = routes.filter((r) => r.layout === "app");

  const authChildren = authRoutes.map((cfg) =>
    createRoute({
      getParentRoute: () => authLayoutRoute,
      path: cfg.path,
      validateSearch: buildValidateSearch(cfg.searchParams),
      beforeLoad: getRoleGuard(cfg.allowedRoles),
      component: makePage(ComponentFactory.get(cfg.component)),
    }),
  );

  const appChildren = appRoutes.map((cfg) =>
    createRoute({
      getParentRoute: () => appLayoutRoute,
      path: cfg.path,
      validateSearch: buildValidateSearch(cfg.searchParams),
      beforeLoad: getRoleGuard(cfg.allowedRoles),
      component: makePage(ComponentFactory.get(cfg.component)),
    }),
  );

  return rootRoute.addChildren([
    authLayoutRoute.addChildren(authChildren),
    appLayoutRoute.addChildren(appChildren),
  ]);
};
