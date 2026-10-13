import { lazy } from "react";

export const SETTING = [
  {
    label: "General",
    component: lazy(() => import("../features/settings/components/General")),
  },
  {
    label: "Members",
    component: lazy(() => import("../features/settings/components/Members")),
  },
  {
    label: "Roles & permissions",
    component: lazy(
      () => import("../features/settings/components/RolesAndPermission"),
    ),
  },
  {
    label: "Invitations",
    component: lazy(() => import("../features/settings/components/Invitation")),
  },
  {
    label: "Appearance",
    component: lazy(() => import("../features/settings/components/Apperance")),
  },
  {
    label: "Notifications",
    component: lazy(
      () => import("../features/settings/components/Notification"),
    ),
  },
  {
    label: "Danger zone",
    component: lazy(() => import("../features/settings/components/DangerZone")),
  },
] as const;
