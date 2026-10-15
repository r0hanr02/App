import { lazy } from "react";

export const PROJECT_SETTING = [
  {
    label: "General",
    component: lazy(
      () => import("../features/projects/components/ProjectDetails/settings/General"),
    ),
  },
  {
    label: "Members",
    component: lazy(
      () => import("../features/projects/components/ProjectDetails/settings/Members"),
    ),
  },
  {
    label: "Roles & permissions",
    component: lazy(
      () => import("../features/projects/components/ProjectDetails/settings/Permissions"),
    ),
  },
  {
    label: "Danger zone",
    component: lazy(
      () => import("../features/projects/components/ProjectDetails/settings/DangerZone"),
    ),
  },
] as const;


