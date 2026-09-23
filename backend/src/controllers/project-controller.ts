import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.ts";
import type { OrganizationParams } from "./organization-controller.ts";
import { Project, ProjectMember } from "../models/index.ts";
import { AppError, asyncHandler } from "../middlewares/error-middleware.ts";
import mongoose from "mongoose";

export const createProject = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { project_name } = req.body;
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

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const [newProject] = await Project.create(
        [{ project_name: project_name.trim(), organization_id }],
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
      if (session.inTransaction()) await session.abortTransaction();
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

    if (
      !organizationId ||
      !mongoose.Types.ObjectId.isValid(organizationId as string)
    ) {
      throw new AppError("Invalid organization id", 400);
    }

    const allProjects = await Project.find({
      organization_id: organizationId,
    });
    res.status(200).json({
      message: "All projects data has been fetch",
      data: allProjects,
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

// export const
