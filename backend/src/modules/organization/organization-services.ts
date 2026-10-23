import mongoose from "mongoose";
import { AppError } from "../../middlewares/error-middleware";
import { Organization, OrganizationMember } from "./organization-model.ts";
import { User } from "../auth/user-model.ts";
import { Project, ProjectMember } from "../projects/project-model.ts";
import { Task } from "../task/task-model.ts";

export const ORGANIZATION_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export interface CreateOrganizationInput {
  organization_name?: string;
  slug?: string;
  organization_description?: string;
  organization_logo?: string;
}

export interface UpdateOrganizationInput {
  organization_name?: string;
  slug?: string;
  organization_description?: string;
  organization_logo?: string;
}

export interface AddMemberInput {
  user_id?: string;
  role?: string;
}

const requireValidObjectId = (value: unknown, message: string): string => {
  if (!value || !mongoose.Types.ObjectId.isValid(value as string)) {
    throw new AppError(message, 400);
  }
  return value as string;
};

export const createOrganizationServices = async (
  userId: any,
  input: CreateOrganizationInput
) => {
  const { organization_name, slug, organization_description, organization_logo } = input;

  if (!organization_name?.trim()) {
    throw new AppError("Organization Name cannot be Empty", 400);
  }

  const normalizedSlug: string = slug
    ? slug.trim().toLowerCase()
    : organization_name.trim().toLowerCase().replaceAll(" ", "_");

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const [organization] = await Organization.create(
      [
        {
          organization_name: organization_name.trim(),
          slug: normalizedSlug,
          ...(organization_description !== undefined
            ? { organization_description }
            : {}),
          ...(organization_logo ? { organization_logo } : {}),
        },
      ],
      { session }
    );

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

    return organization;
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
};

export const getAllOrganizationServices = async (userId: any) => {
  return OrganizationMember.find({
    user_id: userId,
  }).populate("organization_id", "organization_name slug");
};

export const getOrganizationServices = async (organizationId: string) => {
  requireValidObjectId(organizationId, "Invalid organization id");

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  return organization;
};

export const getOrganizationMembersServices = async (
  organizationId: string
) => {
  requireValidObjectId(organizationId, "Invalid organization id");

  return OrganizationMember.find({
    organization_id: organizationId,
  }).populate("user_id", "name email");
};

export const leaveOrganizationServices = async (
  userId: any,
  organizationId: string
) => {
  requireValidObjectId(organizationId, "Invalid organization id");

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
};

export const deleteOrganizationServices = async (organizationId: string) => {
  requireValidObjectId(organizationId, "Invalid organization id");

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const organization =
      await Organization.findById(organizationId).session(session);
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
  } catch (error: any) {
    if (session.inTransaction()) await session.abortTransaction();
    if (error instanceof AppError) throw error;
    throw error;
  } finally {
    await session.endSession();
  }
};

export const updateOrganizationDataServices = async (
  organizationId: string,
  input: UpdateOrganizationInput
) => {
  requireValidObjectId(organizationId, "Invalid organization id");

  const { organization_name, slug, organization_description, organization_logo } = input;

  if (
    !organization_name &&
    !slug &&
    organization_description === undefined &&
    !organization_logo
  ) {
    throw new AppError(
      "At least one field (organization_name, slug, organization_description or organization_logo) is required",
      400
    );
  }

  const update: any = {};
  if (organization_name) update.organization_name = organization_name;
  if (slug) update.slug = slug.trim().toLowerCase();
  if (organization_description !== undefined)
    update.organization_description = organization_description;
  if (organization_logo) update.organization_logo = organization_logo;

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

  return updated;
};

export const addMemberServices = async (
  organizationId: string,
  input: AddMemberInput,
  requesterRole?: string
) => {
  const { user_id, role } = input;

  if (!user_id || !role) {
    throw new AppError("User and role are required", 400);
  }

  requireValidObjectId(organizationId, "Invalid organization id");
  requireValidObjectId(user_id, "Invalid user id");

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
  if (normalizedRole === "ADMIN" && requesterRole !== "OWNER") {
    throw new AppError("Only OWNER can assign ADMIN", 403);
  }

  // Verify target user exists explicitly (404) before relying on validator
  const targetUser = await User.findById(user_id);
  if (!targetUser) {
    throw new AppError("Target user not found", 404);
  }

  try {
    return await OrganizationMember.create({
      organization_id: organizationId,
      user_id,
      role: normalizedRole,
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
};

export const changeMemberRoleServices = async (
  organizationId: string,
  userId: string,
  role: string | undefined,
  requesterRole?: string
) => {
  requireValidObjectId(userId, "User Not Found");
  requireValidObjectId(organizationId, "Invalid organization id");

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

  if (normalizedRole === "ADMIN" && requesterRole !== "OWNER") {
    throw new AppError("Only OWNER can assign ADMIN", 403);
  }

  targetMembership.role = normalizedRole;
  await targetMembership.save();

  return targetMembership;
};

export const removeMemberServices = async (
  organizationId: string,
  userId: string,
  currentUserId?: string
) => {
  requireValidObjectId(organizationId, "Invalid organization id");
  requireValidObjectId(userId, "Invalid user id");

  // Prevent self-removal via this endpoint - use leave
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
};

export const transferOwnershipServices = async (
  organizationId: string,
  currentUserId: any,
  targetId: any
) => {
  if (!targetId || !mongoose.Types.ObjectId.isValid(targetId as string)) {
    throw new AppError("Valid targetUserId is required", 400);
  }

  if (currentUserId && currentUserId === (targetId as string).toString()) {
    throw new AppError("You are already the owner of this organization", 400);
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const requesterMembership = await OrganizationMember.findOne({
      organization_id: organizationId,
      user_id: currentUserId,
    }).session(session);
    if (
      !requesterMembership ||
      (requesterMembership as any).role !== "OWNER"
    ) {
      throw new AppError("Only OWNER can transfer ownership", 403);
    }

    const targetMembership = await OrganizationMember.findOne({
      organization_id: organizationId,
      user_id: targetId,
    }).session(session);
    if (!targetMembership) {
      throw new AppError(
        "Target user is not a member of this organization",
        404
      );
    }
    if ((targetMembership as any).role === "OWNER") {
      throw new AppError("Target user is already an owner", 400);
    }

    (targetMembership as any).role = "OWNER";
    await targetMembership.save({ session });
    (requesterMembership as any).role = "ADMIN";
    await requesterMembership.save({ session });

    await session.commitTransaction();

    return {
      newOwner: targetMembership,
      previousOwner: requesterMembership,
    };
  } catch (error: any) {
    if (session.inTransaction()) await session.abortTransaction();
    if (error instanceof AppError) throw error;
    throw error;
  } finally {
    await session.endSession();
  }
};

