import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth-middleware";
import { Project, ProjectMember } from "../models/index.ts";
import { AppError } from "./error-middleware.ts";
import mongoose from "mongoose";

export const requireProjectMember = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const projectId = (req.params as any).projectId as string;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId as string)) {
      return next(new AppError("Invalid project id", 400));
    }

     const project = await Project.findById(projectId);
        if (!project) {
          return next(new AppError("Project not found", 404));
        }

    const currentUserId =
      (req as any).userId || (req as any).user?.id || (req as any).user?._id;

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
