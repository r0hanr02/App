import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth-middleware";
import { OrganizationMember } from "../models/index.ts";

export const requireOrganizationMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const membership = await OrganizationMember.findOne({
      organization_id: req.params.organizationId,
      user_id: req.user?.id,
    });
    req.organizationMember = membership;
    next()
  } catch (error) {
    return res.status(500).json(error);
  }
};
