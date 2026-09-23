import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth-middleware";
import { Organization, OrganizationMember } from "../models/index.ts";
import mongoose from "mongoose";

export const requireOrganizationMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const organizationId = (req.params as any).organizationId as string;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId as string)) {
      return res.status(400).json({
        message: "Invalid organization id",
      });
    }

    // Spec [5]: verify org exists first (404), then membership (403)
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    // Support both req.userId (current) and req.user.id (spec)
    const currentUserId = (req as any).userId || (req as any).user?.id || (req as any).user?._id;

    const membership = await OrganizationMember.findOne({
      organization_id: organizationId,
      user_id: currentUserId,
    });

    if (!membership) {
      return res.status(403).json({
        message: "Forbidden: You are not a member of this organization",
      });
    }

    req.organizationMember = membership;
    next()
  } catch (error) {
    return res.status(500).json(error);
  }
};
