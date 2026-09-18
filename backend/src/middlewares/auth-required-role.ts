import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth-middleware.ts";

type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";

export const requireOrganizationRole = (...allowedRoles: OrganizationRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const memberRole = req.organizationMember?.role;

    if (!memberRole) {
      return res.status(403).json({
        message: "You are not a member of this organization",
      });
    }

    if (!allowedRoles.includes(memberRole)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};
