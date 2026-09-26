import type { ComponentMap, RouteKey } from "@/types/routes.types";
import { lazy } from "react";

const components: ComponentMap = {
  HOME: lazy(() => import("../pages/Home/Home")),
  LOGIN: lazy(() => import("../pages/Auth/Login/Login")),
  REGISTER: lazy(() => import("../pages/Auth/Register/Register")),
};

export class ComponentFactory {
  static get(key: RouteKey) {
    return components[key];
  }
}
