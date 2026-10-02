export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  // Add protected pages here, e.g. DASHBOARD: "/",
} as const;

export type AppRouteKey = keyof typeof ROUTES;