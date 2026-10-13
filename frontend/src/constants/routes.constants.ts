export const ROUTES = {
  HOME: {
    path: "/",
    requiresAuth: true,
    requireOrg: true,
  },
  LOGIN: {
    path: "/login",
    requiresAuth: false,
    requireOrg: false,
  },
  REGISTER: {
    path: "/register",
    requiresAuth: false,
    requireOrg: false,
  },
  NOORGANIZATION: {
    path: "/no-organization",
    requiresAuth: true,
    requireOrg: false,
  },
  ONBOARDING: {
    path: "/onboarding",
    requiresAuth: true,
    requireOrg: false,
  },
  PROFILE: {
    path: "/profile",
    requiresAuth: true,
    requireOrg: true,
  },
  PROJECTS: {
    path: "/projects",
    requiresAuth: true,
    requireOrg: true,
  },
  TASKS: {
    path: "/tasks",
    requiresAuth: true,
    requireOrg: true,
  },
  USERS: {
    path: "/users",
    requiresAuth: true,
    requireOrg: true,
  },
  ORGANIZATION: {
    path: "/organization",
    requiresAuth: true,
    requireOrg: true,
  },
  NOTIFICATION: {
    path: "/notification",
    requiresAuth: true,
    requireOrg: true,
  },
  SETTINGS: {
    path: "/settings",
    requiresAuth: true,
    requireOrg: true,
  },
} as const;

export type AppRouteKey = keyof typeof ROUTES;
