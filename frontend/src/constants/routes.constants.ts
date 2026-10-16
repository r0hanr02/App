export const ROUTES = {
  HOME: {
    path: "/",
    requiresAuth: true,
    requireOrg: true,
    orgScoped: true,
  },
  LOGIN: {
    path: "/login",
    requiresAuth: false,
    requireOrg: false,
    orgScoped: false,
  },
  REGISTER: {
    path: "/register",
    requiresAuth: false,
    requireOrg: false,
    orgScoped: false,
  },
  NOORGANIZATION: {
    path: "/no-organization",
    requiresAuth: true,
    requireOrg: false,
    orgScoped: false,
  },
  ONBOARDING: {
    path: "/onboarding",
    requiresAuth: true,
    requireOrg: false,
    orgScoped: false,
  },
  PROFILE: {
    path: "/profile",
    requiresAuth: true,
    requireOrg: true,
    // HOME-only test: keep org slug scoping on HOME for now.
    orgScoped: false,
  },
  PROJECTS: {
    path: "/projects",
    requiresAuth: true,
    requireOrg: true,
    orgScoped: true,
  },
  TASKS: {
    path: "/tasks",
    requiresAuth: true,
    requireOrg: true,
    orgScoped: true,
  },
  TEAMS: {
    path: "/teams",
    requiresAuth: true,
    requireOrg: true,
    orgScoped: true,
  },
  ORGANIZATION: {
    path: "/organization",
    requiresAuth: true,
    requireOrg: true,
    orgScoped: true,
  },
  NOTIFICATION: {
    path: "/notification",
    requiresAuth: true,
    requireOrg: true,
    orgScoped: true,
  },
  SETTINGS: {
    path: "/settings",
    requiresAuth: true,
    requireOrg: true,
    orgScoped: true,
  },
  PROJECTDETAILS:{
    path:"/projects/$projectId",
     requiresAuth: true,
    requireOrg: true,
    orgScoped: true,
  }
} as const;

export type AppRouteKey = keyof typeof ROUTES;