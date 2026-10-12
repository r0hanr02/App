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
  },
  PROFILE:{
    path:"/profile",
    requiresAuth:true,
  },
  PROJECTS: {
    path: "/projects",
    requiresAuth: true,
  },
  TASKS: {
    path: "/tasks",
    requiresAuth: true,
  },
  USERS: {
    path: "/users",
    requiresAuth: true,
  },
  ORGANIZATION: {
    path: "/organization",
    requiresAuth: true,
  },
  NOTIFICATION: {
    path: "/notification",
    requiresAuth: true,
  },
  SETTINGS: {
    path: "/settings",
    requiresAuth: true,
  },
} as const;

export type AppRouteKey = keyof typeof ROUTES;
