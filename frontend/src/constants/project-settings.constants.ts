import { lazy } from "react";

export const PROJECT_SETTING = [
  {
    label: "General",
    component: lazy(
      () => import("../features/projects/components/ProjectDetails/settings/General"),
    ),
    show:true
  },
  {
    label: "Members",
    component: lazy(
      () => import("../features/projects/components/ProjectDetails/settings/Members"),
    ),
     show:false
  },
  {
    label: "Roles & permissions",
    component: lazy(
      () => import("../features/projects/components/ProjectDetails/settings/Permissions"),
    ),
     show:true
  },
  {
    label: "Danger zone",
    component: lazy(
      () => import("../features/projects/components/ProjectDetails/settings/DangerZone"),
    ), show:true
  },
] as const;


