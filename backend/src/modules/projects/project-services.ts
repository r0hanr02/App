import mongoose from "mongoose";
import { AppError } from "../../middlewares/error-middleware.ts";
import { Project, ProjectMember } from "./project-model.ts";
import { OrganizationMember } from "../organization/organization-model.ts";
import { User } from "../auth/user-model.ts";
import { Task } from "../task/task-model.ts";

export interface CreateProjectInput {
  project_name?: string;
  project_description?: string;
}

export interface GetAllProjectInput {
  search?: unknown;
  page?: unknown;
  limit?: unknown;
  sort?: unknown;
}

export interface ProjectPagination {
  currentPage: number;
  pageLimit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const requireValidObjectId = (value: unknown, message: string): string => {
  if (!value || !mongoose.Types.ObjectId.isValid(value as string)) {
    throw new AppError(message, 400);
  }
  return value as string;
};

const findProjectOrThrow = async (
  projectId: string,
  organizationId: string
) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError("Project not found", 404);
  }
  if (project.organization_id.toString() !== organizationId) {
    throw new AppError("Project does not belong to this organization", 403);
  }
  return project;
};

export const createProjectServices = async (
  userId: any,
  organizationId: string,
  input: CreateProjectInput
) => {
  const { project_name, project_description } = input;

  if (!project_name?.trim()) {
    throw new AppError("Project name is required", 400);
  }

  requireValidObjectId(organizationId, "Invalid organization id");

  const existingProject = await Project.findOne({
    project_name: project_name.trim(),
    organization_id: organizationId,
  });

  if (existingProject) {
    throw new AppError(
      "A project with this name already exists in this organization",
      409
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const [newProject] = await Project.create(
      [{ project_name: project_name.trim(), project_description, organization_id: organizationId }],
      { session }
    );
    if (!newProject) throw new AppError("Failed to create project", 500);
    await ProjectMember.create(
      [{ project_id: newProject._id, user_id: userId }],
      { session } as any
    );
    await session.commitTransaction();
    return newProject;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    if (error.code === 11000)
      throw new AppError("Project already exists", 409);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const getAllProjectServices = async (
  userId: any,
  organizationId: string,
  orgRole: string | undefined,
  query: GetAllProjectInput
) => {
  requireValidObjectId(organizationId, "Invalid organization id");

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { search, page, limit, sort } = query;

  // Role comes from requireOrganizationMember, fallback to DB
  let role = orgRole;
  if (!role) {
    const orgMembership = await OrganizationMember.findOne({
      organization_id: organizationId,
      user_id: userId,
    }).lean();
    role = (orgMembership as any)?.role;
  }

  const currentPage = Math.max(Number(page) || 1, 1);
  const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (currentPage - 1) * pageLimit;

  const sorted = sort ? String(sort) : "createdAt";
  const filter: any = { organization_id: organizationId };
  if (search) {
    filter.project_name = { $regex: String(search), $options: "i" };
  }

  // MEMBER: restrict to only his projects (same logic as requireProjectAccess/getProject)
  if (role !== "OWNER" && role !== "ADMIN") {
    const memberships = await ProjectMember.find({ user_id: userId })
      .select("project_id")
      .lean();

    const projectIds = memberships.map((m: any) => m.project_id);

    if (projectIds.length === 0) {
      return {
        data: [],
        pagination: {
          currentPage,
          pageLimit,
          totalRecords: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: currentPage > 1,
        } satisfies ProjectPagination,
      };
    }

    // _id + organization_id together = only his projects in this org
    filter._id = { $in: projectIds };
  }

  const [allProjects, totalRecords] = await Promise.all([
    Project.find(filter).skip(skip).limit(pageLimit).sort(sorted),
    Project.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalRecords / pageLimit);

  return {
    data: allProjects,
    pagination: {
      currentPage,
      pageLimit,
      totalRecords,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    } satisfies ProjectPagination,
  };
};

export const getProjectServices = async (
  projectId: string,
  organizationId: string,
  ctx: { userId?: any; projectMember?: unknown; orgRole?: string }
) => {
  requireValidObjectId(projectId, "Invalid project id");
  requireValidObjectId(organizationId, "Invalid organization id");

  // Tenant isolation: project must belong to org
  const project = await findProjectOrThrow(projectId, organizationId);

  if (!ctx.projectMember) {
    const isMember = await ProjectMember.findOne({
      project_id: projectId,
      user_id: ctx.userId,
    });
    if (!isMember && ctx.orgRole === "MEMBER") {
      throw new AppError("You are not a member of this project", 403);
    }
  }

  return project;
};

export const updateProjectServices = async (
  projectId: string,
  organizationId: string,
  project_name: unknown
) => {
  if (typeof project_name !== "string" || !project_name.trim()) {
    throw new AppError("Project name is required", 400);
  }

  requireValidObjectId(projectId, "Invalid project id");
  requireValidObjectId(organizationId, "Invalid organization id");

  const project = await findProjectOrThrow(projectId, organizationId);

  project.project_name = project_name.trim();
  await project.save();

  return project;
};

// Add Member in Project — inline tenant checks (no separate middleware)
export const addMemberInProjectServices = async (
  organizationId: string,
  projectId: string,
  user_id: any
) => {
  requireValidObjectId(organizationId, "Invalid organization id");
  requireValidObjectId(projectId, "Invalid project id");
  requireValidObjectId(user_id, "Invalid user id");

  // Tenant isolation: project must belong to org (no separate middleware)
  await findProjectOrThrow(projectId, organizationId);

  // Target must exist
  const targetUser = await User.findById(user_id);
  if (!targetUser) {
    throw new AppError("Target user not found", 404);
  }

  // Target must be org member
  const orgMembership = await OrganizationMember.findOne({
    organization_id: organizationId,
    user_id,
  });
  if (!orgMembership) {
    throw new AppError(
      "Target user is not a member of this organization",
      400
    );
  }

  // Prevent duplicate (also guarded by unique index)
  const existing = await ProjectMember.findOne({
    project_id: projectId,
    user_id,
  });
  if (existing) {
    throw new AppError("User is already a member of this project", 409);
  }

  try {
    return await ProjectMember.create({
      project_id: projectId,
      user_id,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError("User is already a member of this project", 409);
    }
    throw error;
  }
};

export const getAllMemberInProjectServices = async (
  organizationId: string,
  projectId: string
) => {
  requireValidObjectId(organizationId, "Invalid organization id");
  requireValidObjectId(projectId, "Invalid project id");

  // Tenant isolation inline (no separate middleware)
  await findProjectOrThrow(projectId, organizationId);

  return ProjectMember.find({
    project_id: projectId,
  }).populate("user_id", "name email");
};

export const removeMemberFromProjectServices = async (
  organizationId: string,
  projectId: string,
  userId: string
) => {
  requireValidObjectId(organizationId, "Invalid organization id");
  requireValidObjectId(projectId, "Invalid project id");
  requireValidObjectId(userId, "Invalid user id");

  await findProjectOrThrow(projectId, organizationId);

  const membership = await ProjectMember.findOne({
    project_id: projectId,
    user_id: userId,
  });
  if (!membership) {
    throw new AppError("Project member not found", 404);
  }

  await membership.deleteOne();
};

export const deleteProjectServices = async (
  organizationId: string,
  projectId: string
) => {
  requireValidObjectId(organizationId, "Invalid organization id");
  requireValidObjectId(projectId, "Invalid project id");

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const project = await Project.findById(projectId).session(session);
    if (!project) {
      throw new AppError("Project not found", 404);
    }
    if (project.organization_id.toString() !== organizationId) {
      throw new AppError("Project does not belong to this organization", 403);
    }

    await Task.deleteMany({ project_id: projectId }).session(session);
    await ProjectMember.deleteMany({ project_id: projectId }).session(
      session
    );
    await Project.findByIdAndDelete(projectId).session(session);

    await session.commitTransaction();
  } catch (error: any) {
    if (session.inTransaction()) await session.abortTransaction();
    if (error instanceof AppError) throw error;
    throw error;
  } finally {
    await session.endSession();
  }
};

