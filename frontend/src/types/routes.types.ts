import type { QueryClient } from "@tanstack/react-query";
import type { ComponentType, JSX, LazyExoticComponent } from "react";
import type React from "react";

export type RouteKey = "HOME" | "LOGIN" | "REGISTER";

export type LayoutKey = "auth" | "app";

export type Role = "OWNER" | "USER" | "MEMBER";

export type RouterContext = {
  queryClient: QueryClient;
  isLoggedIn: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    dateOfBirth: string;
  } | null;
};

export type SearchParamConfig = {
  params: string[]; // eg: ["tab", "subtab"]
  defaults?: Record<string, string>;
};

export type RouteConfig = {
  key: RouteKey;
  path: string;
  component: RouteKey;
  layout: LayoutKey;
  allowedRoles?: Role[];
  showInSidebar?: boolean;
  icon?: React.ElementType | ((size?: number, color?: string) => JSX.Element);
  activeMatch?: string[];
  searchParams?: SearchParamConfig;
};

export type ComponentMap = Record<RouteKey, LazyExoticComponent<ComponentType>>;
