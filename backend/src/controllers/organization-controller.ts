import type { Response } from "express";
import mongoose from "mongoose";
import { Organization, OrganizationMember } from "../models/index.ts";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.ts";

interface OrganizationParams {
  organizationId?: string;
  userId?: string;
}

const ORGANIZATION_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const createOrganization = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const { organization_name, slug } = req.body;
    if (!organization_name) {
      return res.status(409).json({
        message: "Organization Name cannot be Empty",
      });
    }

    const organization = await Organization.create({
      organization_name,
      slug,
    });

    const userId = req.user?.id;

    await OrganizationMember.create({
      organization_id: organization.id,
      user_id: userId,
      role: "OWNER",
    });
    return res.status(200).json({
      message: "Organization created Successfully",
      organization,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

export const getAllOrganization = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const memberships = await OrganizationMember.find({
      user_id: userId,
    });
    console.log(memberships);
    return res.status(200).json({
      message: "data fetched Successfully",
    });
  } catch (error) {
    console.log(error);
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

    const organization = await Organization.findById( organizationId );
    if (!organization) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }
    console.log(organization);
    return res.status(200).json({
      message: "data fetched Successfully",
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

    const member = await OrganizationMember.create({
      organization_id: organizationId,
      user_id,
      role: normalizedRole,
    });

    return res.status(201).json({
      message: "User added successfully",
      member,
    });
  } catch (error) {
    console.log(error);

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
