import {
  Bell,
  Folder,
  Layers,
  LayoutDashboard,
  ListTodo,
  Settings,
  Users,
} from "lucide-react";
import { ROUTES, type AppRouteKey } from "./routes.constants";

export const SIDEBAR: {
  label: string;
  logo: typeof LayoutDashboard;
  routeKey: AppRouteKey;
  /** Unscoped path (e.g. "/projects") — use getRoutePath(routeKey) for the real `to`. */
  routeTo: string;
}[] = [
  { label: "Dashboard", logo: LayoutDashboard, routeKey: "HOME", routeTo: ROUTES.HOME.path },
  { label: "Projects", logo: Folder, routeKey: "PROJECTS", routeTo: ROUTES.PROJECTS.path },
  { label: "My Tasks", logo: ListTodo, routeKey: "TASKS", routeTo: ROUTES.TASKS.path },
  { label: "Teams", logo: Users, routeKey: "TEAMS", routeTo: ROUTES.TEAMS.path },
  { label: "Organization", logo: Layers, routeKey: "ORGANIZATION", routeTo: ROUTES.ORGANIZATION.path },
  { label: "Notification", logo: Bell, routeKey: "NOTIFICATION", routeTo: ROUTES.NOTIFICATION.path },
  { label: "Settings", logo: Settings, routeKey: "SETTINGS", routeTo: ROUTES.SETTINGS.path },
];
