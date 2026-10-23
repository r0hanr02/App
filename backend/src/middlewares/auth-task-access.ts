import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth-middleware";
import { Task } from "../modules/task/task-model.ts";
import { AppError } from "./error-middleware.ts";
import mongoose from "mongoose";

export const requireTaskAccess = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const taskId = (req.params as any).taskId as string;
    const projectId = (req.params as any).projectId as string;
    const organizationId = (req.params as any).organizationId as string;

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return next(new AppError("Invalid task id", 400));
    }

    const task = await Task.findOne({
      _id: taskId,
      project_id: projectId,
      organization_id: organizationId,
      is_deleted: false,
    });
    if (!task) {
      return next(new AppError("Task not found", 404));
    }

    (req as any).task = task;
    next();
  } catch (error) {
    next(error);
  }
};
