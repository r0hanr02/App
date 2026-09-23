import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth-middleware.ts";
import { AppError } from "./error-middleware.ts";

type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";

export const requireOrganizationRole = (
  ...allowedRoles: OrganizationRole[]
) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const memberRole = (req as any).organizationMember?.role;

    if (!memberRole) {
      return next(
        new AppError("You are not a member of this organization", 403)
      );
    }

    if (!allowedRoles.includes(memberRole)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
