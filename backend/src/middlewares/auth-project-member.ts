import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth-middleware";
import { Project, ProjectMember } from "../modules/projects/project-model.ts";
import { AppError } from "./error-middleware.ts";
import mongoose from "mongoose";

export const requireProjectAccess = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const projectId = (req.params as any).projectId as string;
    const organizationId = (req.params as any).organizationId as string;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId as string)) {
      return next(new AppError("Invalid project id", 400));
    }

    if (
      !organizationId ||
      !mongoose.Types.ObjectId.isValid(organizationId as string)
    ) {
      return next(new AppError("Invalid organization id", 400));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    if (project.organization_id.toString() !== organizationId) {
      return next(
        new AppError("Project does not belong to this organization", 403)
      );
    }

    (req as any).project = project;

    const currentUserId =
      (req as any).userId || (req as any).user?.id || (req as any).user?._id;

    if (!currentUserId) {
      return next(new AppError("Unauthorized: User not authenticated", 401));
    }

    if (!mongoose.Types.ObjectId.isValid(currentUserId.toString())) {
      return next(new AppError("Forbidden: Invalid User Id", 400));
    }

    const orgRole = (req as any).organizationMember?.role;
    if (orgRole === "OWNER" || orgRole === "ADMIN") {
      (req as any).projectMember = null;
      return next();
    }

    const membership = await ProjectMember.findOne({
      project_id: projectId,
      user_id: currentUserId,
    });
    if (!membership) {
      return next(
        new AppError("Forbidden: You are not a member of this Project", 403)
      );
    }

    (req as any).projectMember = membership;
    next();
  } catch (error) {
    next(error);
  }
};
