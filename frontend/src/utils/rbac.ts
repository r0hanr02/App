import type { Role } from "@/types/routes.types";

export const canAccess = (userRoles: Role[], allowed: Role[]) => {
  if (userRoles.includes("OWNER")) return true;
  return userRoles.some((r) => allowed.includes(r));
};
