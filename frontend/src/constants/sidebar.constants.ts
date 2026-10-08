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
  { label: "Projects", logo: Folder, routeTo: "/projects" },
  { label: "My Tasks", logo: ListTodo, routeTo: "/tasks" },
  { label: "Users", logo: Users, routeTo: "/users" },
  { label: "Organization", logo: Layers, routeTo: "/organization" },
  { label: "Notification", logo: Bell, routeTo: "/notification" },
  { label: "Settings", logo: Settings, routeTo: "/settings" },
] as const;
