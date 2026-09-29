import type { Response } from "express";
import { AppError, asyncHandler } from "../middlewares/error-middleware.ts";
import type { OrganizationParams } from "./organization-controller.ts";
import { Task, User } from "../models/index.ts";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.ts";
import mongoose from "mongoose";

export const createTask = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId, projectId } = req.params;
    const {
      task_name,
      description,
      status,
      priority,
      type,
      due_date,
      assignee_id,
    } = req.body;

    const userId = req.userId;

    if (!assignee_id || !mongoose.Types.ObjectId.isValid(assignee_id)) {
      throw new AppError("User Id Not Found", 400);
    }

    const user = await User.findById(assignee_id);
    if (!user) {
      throw new AppError("User Not Found", 400);
    }

    const newTask = await Task.create({
      assignee_id,
      task_name,
      description,
      status,
      priority,
      type,
      due_date,
      project_id: projectId,
      organization_id: organizationId,
      creator_id: userId,
      is_deleted: false,
    });

    res.status(200).json({
      message: "task has been created",
      data: newTask,
    });
  }
);

export const getTaskDetails = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { taskId } = req.params;

    if (!taskId) {
      throw new AppError("task Id not found", 404);
    }

    const taskData = await Task.findById(taskId)
      .populate("assignee_id", "name")
      .populate("creator_id", "name");
    res.status(200).json({
      message: "Task data fetched",
      data: taskData,
    });
  }
);

export const getAllTask = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { projectId } = req.params;

    const taskData = await Task.find({
      project_id: projectId,
    })
      .populate("assignee_id", "name")
      .populate("creator_id", "name");
    res.status(200).json({
      message: "All the task data fetched",
      data: taskData,
    });
  }
);
