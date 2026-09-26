import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { buildRouteTree } from "./factories/RouteFactory";
import { routesConfig } from "./routes/routes.config";
import { authStore } from "./store/auth.store";
import type { RouterContext } from "./types/routes.types";

export const queryClient = new QueryClient();

const routeTree = buildRouteTree(routesConfig);

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    get isLoggedIn() {
      return authStore.isLoggedIn.get();
    },
    get user() {
      return authStore.user.get();
    },
  } satisfies RouterContext,
});
