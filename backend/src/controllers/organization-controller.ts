import type { Response } from "express";
import mongoose from "mongoose";
import {
  Organization,
  OrganizationMember,
  User,
  Project,
  ProjectMember,
  Task,
} from "../models/index.ts";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.ts";
import { AppError, asyncHandler } from "../middlewares/error-middleware.ts";

export interface OrganizationParams {
  organizationId?: string;
  userId?: string;
  projectId?: string;
}

const ORGANIZATION_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const createOrganization = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organization_name, slug } = req.body;
    if (!organization_name?.trim()) {
      throw new AppError("Organization Name cannot be Empty", 400);
    }

    const session = await mongoose.startSession();
    try {
      await session.startTransaction();
      const normalizedSlug: string = slug
        ? slug.trim().toLowerCase()
        : organization_name.trim().toLowerCase().replaceAll(" ", "_");

      const [organization] = await Organization.create(
        [
          {
            organization_name,
            slug: normalizedSlug,
          },
        ],
        { session }
      );

      const userId = (req as any).userId || (req as any).user?.id;
      const [organizationMember] = await OrganizationMember.create(
        [
          {
            organization_id: organization?._id,
            user_id: userId,
            role: "OWNER",
          },
        ],
        { session }
      );

      if (!organizationMember) {
        throw new AppError("Failed to create organization member", 500);
      }

      await session.commitTransaction();

      res.status(201).json({
        message: "Organization created Successfully",
        data: organization,
      });
    } catch (error: any) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      if (error instanceof AppError) throw error;
      if (error.code === 11000) {
        throw new AppError("Organization name already exists", 409);
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }
);

export const getAllOrganization = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const userId = (req as any).userId || (req as any).user?.id;
    const memberships = await OrganizationMember.find({
      user_id: userId,
    });
    // .populate("user_id", "name email")
    // .populate("organization_id", "organization_name");
    res.status(200).json({
      message: "data fetched Successfully",
      data: memberships,
    });
  }
);

export const getOrganization = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError("Invalid organization id", 400);
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new AppError("Organization not found", 404);
    }
    res.status(200).json({
      message: "data fetched Successfully",
      data: organization,
    });
  }
);

export const getOrganizationMembers = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError("Invalid organization id", 400);
    }
    const organizationMember = await OrganizationMember.find({
      organization_id: organizationId,
    }).populate("user_id", "name email");

    res.status(200).json({
      message: "All Organization Member Data fetched.",
      data: organizationMember,
    });
  }
);

export const leaveOrganization = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const userId = (req as any).userId || (req as any).user?.id;
    const { organizationId } = req.params;

    if (
      !organizationId ||
      !mongoose.Types.ObjectId.isValid(organizationId as string)
    ) {
      throw new AppError("Invalid organization id", 400);
    }

    const membership = await OrganizationMember.findOne({
      user_id: userId,
      organization_id: organizationId,
    });

    if (!membership) {
      throw new AppError("Membership not found", 404);
    }

    // Prevent last OWNER from leaving without transfer
    if ((membership as any).role === "OWNER") {
      const otherOwners = await OrganizationMember.countDocuments({
        organization_id: organizationId,
        role: "OWNER",
        _id: { $ne: (membership as any)._id },
      });
      if (otherOwners === 0) {
        throw new AppError(
          "Cannot leave: you are the last owner. Transfer ownership first via POST /organization/:organizationId/transfer-ownership",
          400
        );
      }
    }

    await membership.deleteOne();

    // Cleanup: remove user from all projects in this org (stays org-independent otherwise)
    const orgProjects = await Project.find({
      organization_id: organizationId,
    }).select("_id");
    if (orgProjects.length > 0) {
      await ProjectMember.deleteMany({
        project_id: { $in: orgProjects.map((p) => p._id) },
        user_id: userId,
      });
    }

    res.status(200).json({
      message: "You've left the Organization",
    });
  }
);

export const deleteOrganization = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError("Invalid organization id", 400);
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const organization = await Organization.findById(organizationId).session(
        session
      );
      if (!organization) {
        throw new AppError("Organization not found", 404);
      }

      // Cascade: Projects -> Tasks -> ProjectMembers -> OrgMembers -> Org
      const orgProjects = await Project.find({
        organization_id: organizationId,
      })
        .select("_id")
        .session(session);
      const projectIds = orgProjects.map((p) => p._id);

      if (projectIds.length > 0) {
        await Task.deleteMany({ project_id: { $in: projectIds } }).session(
          session
        );
        await ProjectMember.deleteMany({
          project_id: { $in: projectIds },
        }).session(session);
        await Project.deleteMany({ organization_id: organizationId }).session(
          session
        );
      }

      await OrganizationMember.deleteMany({
        organization_id: organizationId,
      }).session(session);
      await Organization.findByIdAndDelete(organizationId).session(session);

      await session.commitTransaction();
      res.status(200).json({
        message: "Organization Deleted Successfully.",
        data: {
          deletedProjects: projectIds.length,
        },
      });
    } catch (error: any) {
      if (session.inTransaction()) await session.abortTransaction();
      if (error instanceof AppError) throw error;
      throw error;
    } finally {
      await session.endSession();
    }
  }
);

export const updateOrganizationData = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError("Invalid organization id", 400);
    }

    const { organization_name, slug } = req.body;

    if (!organization_name && !slug) {
      throw new AppError(
        "At least one field (organization_name or slug) is required",
        400
      );
    }

    const update: any = {};
    if (organization_name) update.organization_name = organization_name;
    if (slug) update.slug = slug.trim().toLowerCase();

    const updated = await Organization.findByIdAndUpdate(
      organizationId,
      update,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      throw new AppError("Organization not found", 404);
    }

    res.status(200).json({
      message: "Organization data has been changed.",
      data: updated,
    });
  }
);

//Organization Member

export const addMember = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { user_id, role } = req.body;
    const { organizationId } = req.params;

    if (!user_id || !role) {
      throw new AppError("User and role are required", 400);
    }

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError("Invalid organization id", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      throw new AppError("Invalid user id", 400);
    }

    const normalizedRole = String(role)
      .trim()
      .toUpperCase() as OrganizationRole;

    if (!ORGANIZATION_ROLES.includes(normalizedRole)) {
      throw new AppError(
        `Role must be one of: ${ORGANIZATION_ROLES.join(", ")}`,
        400
      );
    }

    // [4] Spec: Ownership via separate transfer-ownership operation, not normal POST /member
    if (normalizedRole === "OWNER") {
      throw new AppError(
        "Cannot assign OWNER via this endpoint. Use POST /organization/:organizationId/transfer-ownership",
        400
      );
    }

    // [4] Spec: Only OWNER can assign ADMIN (ADMIN cannot assign ADMIN)
    if (
      normalizedRole === "ADMIN" &&
      (req as any).organizationMember?.role !== "OWNER"
    ) {
      throw new AppError("Only OWNER can assign ADMIN", 403);
    }

    // Verify target user exists explicitly (404) before relying on validator
    const targetUser = await User.findById(user_id);
    if (!targetUser) {
      throw new AppError("Target user not found", 404);
    }

    try {
      const member = await OrganizationMember.create({
        organization_id: organizationId,
        user_id,
        role: normalizedRole,
      });

      res.status(201).json({
        message: "User added successfully",
        data: member,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError(
          "User is already a member of this organization",
          409
        );
      }
      throw error;
    }
  }
);

export const changeMemberRole = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { role } = req.body;
    const { organizationId, userId } = req.params as any;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("User Not Found", 400);
    }

    if (
      !organizationId ||
      !mongoose.Types.ObjectId.isValid(organizationId as string)
    ) {
      throw new AppError("Invalid organization id", 400);
    }

    if (!role) {
      throw new AppError("Role is required", 400);
    }

    const normalizedRole = String(role)
      .trim()
      .toUpperCase() as OrganizationRole;

    if (!ORGANIZATION_ROLES.includes(normalizedRole)) {
      throw new AppError(
        `Role must be one of: ${ORGANIZATION_ROLES.join(", ")}`,
        400
      );
    }

    if (normalizedRole === "OWNER") {
      throw new AppError(
        "Cannot assign OWNER via this endpoint. Use transfer-ownership",
        400
      );
    }

    // Ensure target is member of this org
    const targetMembership = await OrganizationMember.findOne({
      organization_id: organizationId,
      user_id: userId,
    });

    if (!targetMembership) {
      throw new AppError(
        "Target user is not a member of this organization",
        404
      );
    }

    // Prevent demoting last OWNER (normalizedRole is already blocked from being OWNER, so any change is a demotion)
    if (targetMembership.role === "OWNER") {
      const otherOwners = await OrganizationMember.countDocuments({
        organization_id: organizationId,
        role: "OWNER",
        _id: { $ne: targetMembership._id },
      });
      if (otherOwners === 0) {
        throw new AppError(
          "Cannot demote the last owner of an organization",
          400
        );
      }
    }

    if (
      normalizedRole === "ADMIN" &&
      (req as any).organizationMember?.role !== "OWNER"
    ) {
      throw new AppError("Only OWNER can assign ADMIN", 403);
    }

    targetMembership.role = normalizedRole;
    await targetMembership.save();

    res.status(200).json({
      message: "Role has been changed for the user",
      data: targetMembership,
    });
  }
);

export const removeMember = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId, userId } = req.params;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError("Invalid organization id", 400);
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user id", 400);
    }

    // Prevent self-removal via this endpoint - use leave
    const currentUserId =
      (req as any).userId?.toString() || (req as any).user?.id;
    if (currentUserId && currentUserId === userId) {
      throw new AppError(
        "Use DELETE /organization/:organizationId/leave to remove yourself",
        400
      );
    }

    // Prevent removing last OWNER
    const target = await OrganizationMember.findOne({
      organization_id: organizationId,
      user_id: userId,
    });
    if (!target) {
      throw new AppError("Organization member not found", 404);
    }
    if (target.role === "OWNER") {
      const otherOwners = await OrganizationMember.countDocuments({
        organization_id: organizationId,
        role: "OWNER",
        _id: { $ne: target._id },
      });
      if (otherOwners === 0) {
        throw new AppError(
          "Cannot remove the last owner of an organization",
          400
        );
      }
    }

    await target.deleteOne();

    res.status(200).json({
      message: "User removed successfully",
    });
  }
);
