import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth-middleware";
import { Organization, OrganizationMember } from "../models/index.ts";
import mongoose from "mongoose";
import { AppError } from "./error-middleware.ts";

export const requireOrganizationMember = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = (req.params as any).organizationId as string;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId as string)) {
      return next(new AppError("Invalid organization id", 400));
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return next(new AppError("Organization not found", 404));
    }

    const currentUserId = (req as any).userId || (req as any).user?.id || (req as any).user?._id;

    const membership = await OrganizationMember.findOne({
      organization_id: organizationId,
      user_id: currentUserId,
    });

    if (!membership) {
      return next(new AppError("Forbidden: You are not a member of this organization", 403));
    }

    req.organizationMember = membership;
    next();
  } catch (error) {
    next(error);
  }
};
