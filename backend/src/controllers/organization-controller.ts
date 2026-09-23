import type { Response } from "express";
import mongoose from "mongoose";
import { Organization, OrganizationMember, User } from "../models/index.ts";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.ts";

export interface OrganizationParams {
  organizationId?: string;
  userId?: string;
  projectId?: string;
}

const ORGANIZATION_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const createOrganization = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  const { organization_name, slug } = req.body;
  if (!organization_name?.trim()) {
    return res.status(400).json({
      message: "Organization Name cannot be Empty",
    });
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

    const userId = req.userId;
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
      throw new Error("Failed to create organization member");
    }

    await session.commitTransaction();

    return res.status(201).json({
      message: "Organization created Successfully",
      data: organization,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    if ((error as any).code === 11000) {
      return res.status(409).json({
        message: "Organization name already exists",
      });
    }
    req.log.error({ error }, "Failed to create organization");
    return res.status(500).json(error);
  } finally {
    await session.endSession();
  }
};

export const getAllOrganization = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const userId = req.userId;
    const memberships = await OrganizationMember.find({
      user_id: userId,
    });
    return res.status(200).json({
      message: "data fetched Successfully",
      data: memberships,
    });
  } catch (error) {
    req.log.error({ error }, "failed to Fetch Data");
    return res.status(500).json(error);
  }
};

export const getOrganization = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const { organizationId } = req.params;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        message: "Invalid organization id",
      });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }
    console.log(organization);
    return res.status(200).json({
      message: "data fetched Successfully",
      data: organization,
    });
  } catch (error) {
    req.log.error({ error }, "failed to Fetch Data");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getOrganizationMembers = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const { organizationId } = req.params;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        message: "Invalid organization id",
      });
    }
    const organizationMember = await OrganizationMember.find({
      organization_id: organizationId,
    }).populate("user_id", "name email");
    //   .populate("organization_id", "organization_name slug");

    return res.status(200).json({
      message: "All Organization Member Data fetched.",
      data: organizationMember,
    });
  } catch (error) {
    req.log.error({ error }, "failed to Fetch Data");

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const leaveOrganization = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const userId = req.userId;
    const { organizationId } = req.params;
    await OrganizationMember.findOneAndDelete({
      user_id: userId,
      organization_id: organizationId,
    });
    return res.status(200).json({
      message: "You've leaved the Organization",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const removeOrganization = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const { organizationId } = req.params;
    await Organization.findByIdAndDelete(organizationId);
    await OrganizationMember.deleteMany({
      organization_id: organizationId,
    });
    return res.status(200).json({
      message: "Organization Deleted Successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateOrganizationData = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const { organizationId } = req.params;
    const { organization_name, slug } = req.body;
    await Organization.findByIdAndUpdate(organizationId, {
      ...(organization_name && { organization_name }),
      ...(slug && { slug }),
    });
    return res.status(200).json({
      message: "Organization data has been changed.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//Organization Member

export const addMember = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const { user_id, role } = req.body;
    const { organizationId } = req.params;

    if (!user_id || !role) {
      return res.status(400).json({
        message: "User and role are required",
      });
    }

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        message: "Invalid organization id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const normalizedRole = String(role)
      .trim()
      .toUpperCase() as OrganizationRole;

    if (!ORGANIZATION_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        message: `Role must be one of: ${ORGANIZATION_ROLES.join(", ")}`,
      });
    }

    // [4] Spec: Ownership via separate transfer-ownership operation, not normal POST /member
    if (normalizedRole === "OWNER") {
      return res.status(400).json({
        message:
          "Cannot assign OWNER via this endpoint. Use POST /organization/:organizationId/transfer-ownership",
      });
    }

    // [4] Spec: Only OWNER can assign ADMIN (ADMIN cannot assign ADMIN)
    if (
      normalizedRole === "ADMIN" &&
      req.organizationMember?.role !== "OWNER"
    ) {
      return res.status(403).json({ message: "Only OWNER can assign ADMIN" });
    }

    // Verify target user exists explicitly (404) before relying on validator
    const targetUser = await User.findById(user_id);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const member = await OrganizationMember.create({
      organization_id: organizationId,
      user_id,
      role: normalizedRole,
    });

    return res.status(201).json({
      message: "User added successfully",
      data: member,
    });
  } catch (error) {
    req.log.error({ error }, "failed to add Data");

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if ((error as { code?: number }).code === 11000) {
      return res.status(409).json({
        message: "User is already a member of this organization",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const changeMemberRole = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const { user_id, role } = req.body;
    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        message: "User Not Found",
      });
    }
    await OrganizationMember.findOneAndUpdate(
      { user_id: user_id },
      {
        role,
      }
    );
    return res.status(200).json({
      message: "Role has been changed for the user",
    });
  } catch (error) {
    req.log.error({ error });

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const removeMember = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const { organizationId, userId } = req.params;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        message: "Invalid organization id",
      });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const result = await OrganizationMember.deleteOne({
      organization_id: organizationId,
      user_id: userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Organization member not found",
      });
    }

    return res.status(200).json({
      message: "User removed successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
