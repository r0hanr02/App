export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  // Add protected pages here, e.g. DASHBOARD: "/",
} as const;

export type AppRouteKey = keyof typeof ROUTES;