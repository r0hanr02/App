import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.ts";
import type { OrganizationParams } from "./organization-controller.ts";
import {
  Project,
  ProjectMember,
  OrganizationMember,
  User,
  Task,
} from "../models/index.ts";
import { AppError, asyncHandler } from "../middlewares/error-middleware.ts";
import mongoose from "mongoose";

export const createProject = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { project_name,project_description } = req.body;
    const organization_id = (req.params as any).organizationId;

    if (!project_name?.trim()) {
      throw new AppError("Project name is required", 400);
    }

    if (
      !organization_id ||
      !mongoose.Types.ObjectId.isValid(organization_id as string)
    ) {
      throw new AppError("Invalid organization id", 400);
    }

    const userId = (req as any).userId || (req as any).user?.id;
    const existingProject = await Project.findOne({
      project_name: project_name.trim(),
      organization_id,
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
        [{ project_name: project_name.trim(),project_description, organization_id }],
        { session }
      );
      if (!newProject) throw new AppError("Failed to create project", 500);
      await ProjectMember.create(
        [{ project_id: newProject._id, user_id: userId }],
        { session } as any
      );
      await session.commitTransaction();
      res.status(201).json({
        message: "Project Created Successfully",
        data: newProject,
      });
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error.code === 11000)
        throw new AppError("Project already exists", 409);
      throw error;
    } finally {
      await session.endSession();
    }
  }
);

export const getAllProject = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const organizationId = (req.params as any).organizationId;
    const { search, page, limit, sort } = req.query;

    if (
      !organizationId ||
      !mongoose.Types.ObjectId.isValid(organizationId as string)
    ) {
      throw new AppError("Invalid organization id", 400);
    }

    const userId =
      (req as any).userId || (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    // Role comes from requireOrganizationMember, fallback to DB
    let orgRole = (req as any).organizationMember?.role;
    if (!orgRole) {
      const orgMembership = await OrganizationMember.findOne({
        organization_id: organizationId,
        user_id: userId,
      }).lean();
      orgRole = (orgMembership as any)?.role;
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
    if (orgRole !== "OWNER" && orgRole !== "ADMIN") {
      const memberships = await ProjectMember.find({ user_id: userId })
        .select("project_id")
        .lean();

      const projectIds = memberships.map((m: any) => m.project_id);

      if (projectIds.length === 0) {
        res.status(200).json({
          message: "All projects data has been fetch",
          data: [],
          pagination: {
            currentPage,
            pageLimit,
            totalRecords: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: currentPage > 1,
          },
        });
        return;
      }

      // _id + organization_id together = only his projects in this org
      filter._id = { $in: projectIds };
    }

    const [allProjects, totalRecords] = await Promise.all([
      Project.find(filter).skip(skip).limit(pageLimit).sort(sorted),
      Project.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / pageLimit);

    res.status(200).json({
      message: "All projects data has been fetch",
      data: allProjects,
      pagination: {
        currentPage,
        pageLimit,
        totalRecords,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  }
);

export const getProject = asyncHandler(
  async (
    req: AuthenticatedRequest<OrganizationParams & { projectId?: string }>,
    res: Response
  ) => {
    const { projectId } = req.params as { projectId: string };
    const { organizationId } = req.params as any;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError("Invalid project id", 400);
    }

    if (
      !organizationId ||
      !mongoose.Types.ObjectId.isValid(organizationId as string)
    ) {
      throw new AppError("Invalid organization id", 400);
    }

    // Tenant isolation: project must belong to org
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404);
    }
    if (project.organization_id.toString() !== organizationId) {
      throw new AppError("Project does not belong to this organization", 403);
    }

    if (!(req as any).projectMember) {
      const isMember = await ProjectMember.findOne({
        project_id: projectId,
        user_id: (req as any).userId || (req as any).user?.id,
      });
      const orgRole = (req as any).organizationMember?.role;
      if (!isMember && orgRole === "MEMBER") {
        throw new AppError("You are not a member of this project", 403);
      }
    }

    res.status(200).json({
      message: "Project fetched successfully",
      data: project,
    });
  }
);

export const updateProject = asyncHandler(
  async (
    req: AuthenticatedRequest<OrganizationParams & { projectId?: string }>,
    res: Response
  ) => {
    const { project_name } = req.body;
    const { projectId } = req.params as { projectId: string };
    const { organizationId } = req.params as any;

    if (!project_name?.trim()) {
      throw new AppError("Project name is required", 400);
    }

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError("Invalid project id", 400);
    }

    if (
      !organizationId ||
      !mongoose.Types.ObjectId.isValid(organizationId as string)
    ) {
      throw new AppError("Invalid organization id", 400);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404);
    }
    if (project.organization_id.toString() !== organizationId) {
      throw new AppError("Project does not belong to this organization", 403);
    }

    project.project_name = project_name.trim();
    await project.save();

    res.status(200).json({
      message: "Project Name has been Updated",
      data: project,
    });
  }
);

// Add Member in Project — inline tenant checks (no separate middleware)
export const addMemberInProject = asyncHandler(
  async (
    req: AuthenticatedRequest<{
      organizationId?: string;
      projectId?: string;
    }>,
    res: Response
  ) => {
    const { organizationId, projectId } = req.params;
    const { user_id } = req.body;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError("Invalid organization id", 400);
    }

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError("Invalid project id", 400);
    }

    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
      throw new AppError("Invalid user id", 400);
    }

    // Tenant isolation: project must belong to org (no separate middleware)
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404);
    }
    if (project.organization_id.toString() !== organizationId) {
      throw new AppError("Project does not belong to this organization", 403);
    }

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
      const newMember = await ProjectMember.create({
        project_id: projectId,
        user_id,
      });

      return res.status(201).json({
        message: "User Added Successfully",
        data: newMember,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError("User is already a member of this project", 409);
      }
      throw error;
    }
  }
);

export const getAllMemberInProject = asyncHandler(
  async (
    req: AuthenticatedRequest<
      OrganizationParams & {
        organizationId?: string;
        projectId?: string;
      }
    >,
    res: Response
  ) => {
    const { organizationId, projectId } = req.params;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError("Invalid organization id", 400);
    }

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError("Invalid project id", 400);
    }

    // Tenant isolation inline (no separate middleware)
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404);
    }
    if (project.organization_id.toString() !== organizationId) {
      throw new AppError("Project does not belong to this organization", 403);
    }

    const members = await ProjectMember.find({
      project_id: projectId,
    }).populate("user_id", "name email");
    return res.status(200).json({
      message: "Project members fetched successfully",
      data: members,
    });
  }
);

export const removeMemberFromProject = asyncHandler(
  async (
    req: AuthenticatedRequest<{
      organizationId?: string;
      projectId?: string;
      userId?: string;
    }>,
    res: Response
  ) => {
    const { organizationId, projectId, userId } = req.params as any;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError("Invalid organization id", 400);
    }
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError("Invalid project id", 400);
    }
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user id", 400);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError("Project not found", 404);
    }
    if (project.organization_id.toString() !== organizationId) {
      throw new AppError("Project does not belong to this organization", 403);
    }

    const membership = await ProjectMember.findOne({
      project_id: projectId,
      user_id: userId,
    });
    if (!membership) {
      throw new AppError("Project member not found", 404);
    }

    await membership.deleteOne();

    return res.status(200).json({
      message: "User removed from project successfully",
    });
  }
);

export const deleteProject = asyncHandler(
  async (
    req: AuthenticatedRequest<{
      organizationId?: string;
      projectId?: string;
    }>,
    res: Response
  ) => {
    const { organizationId, projectId } = req.params as any;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError("Invalid organization id", 400);
    }
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError("Invalid project id", 400);
    }

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
      return res.status(200).json({
        message: "Project deleted successfully",
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
