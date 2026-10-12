import {
  Bell,
  Folder,
  Layers,
  LayoutDashboard,
  ListTodo,
  Settings,
  Users,
} from "lucide-react";
import { ROUTES } from "./routes.constants";

export const SIDEBAR = [
  { label: "Dashboard", logo: LayoutDashboard, routeTo: ROUTES.HOME.path },
  { label: "Projects", logo: Folder, routeTo: ROUTES.PROJECTS.path },
  { label: "My Tasks", logo: ListTodo, routeTo: ROUTES.TASKS.path },
  { label: "Users", logo: Users, routeTo: ROUTES.USERS.path },
  { label: "Organization", logo: Layers, routeTo: ROUTES.ORGANIZATION.path },
  { label: "Notification", logo: Bell, routeTo: ROUTES.NOTIFICATION.path },
  { label: "Settings", logo: Settings, routeTo: ROUTES.SETTINGS.path },
] as const;
