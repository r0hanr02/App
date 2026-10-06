export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  NOORGANIZATION:"/no-organization",
  DASHBOARD:"/dashboard"
  // Add protected pages here, e.g. DASHBOARD: "/",
} as const;

export type AppRouteKey = keyof typeof ROUTES;