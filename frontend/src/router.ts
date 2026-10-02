import {
  createRootRouteWithContext,
  createRouter,
} from "@tanstack/react-router";
import { createAppRoutes } from "./factories/RouteFactory";
import { queryClient } from "./lib/queryClient";
import type { RouterContext } from "./types/router.types";
import RootLayout from "./components/layouts/RootLayout";
import NotFound from "./components/NotFound/NotFound";

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFound,
});

const routeTree = rootRoute.addChildren(createAppRoutes(rootRoute));

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    // Real value is injected in React-land via
    // <RouterProvider router={router} context={{ auth }} /> in App.tsx
    auth: undefined!,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
