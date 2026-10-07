export const ROUTES = {
  HOME: {
    path: "/",
    requiresAuth: true,
  },
  LOGIN: {
    path: "/login",
    requiresAuth: false,
  },
  REGISTER: {
    path: "/register",
    requiresAuth: false,
  },
  NOORGANIZATION: {
    path: "/no-organization",
    requiresAuth: true,
  },
  ONBOARDING:{
    path:"/onboarding",
    requiresAuth:true,
  }
} as const;

export type AppRouteKey = keyof typeof ROUTES;
