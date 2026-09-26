import type { RouteConfig } from "@/types/routes.types";

export const routesConfig: RouteConfig[] = [
  {
    key: "LOGIN",
    path: "/login",
    component: "LOGIN",
    layout: "auth",
  },
  {
    key: "REGISTER",
    path: "/register",
    component: "REGISTER",
    layout: "auth",
  },
  {
    key: "HOME",
    path: "/",
    component: "HOME",
    layout: "app",
  },
];
