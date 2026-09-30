import type { Response } from "express";
import { AppError, asyncHandler } from "../middlewares/error-middleware.ts";
import type { OrganizationParams } from "./organization-controller.ts";
import { Task, User, OrganizationMember } from "../models/index.ts";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.ts";
import mongoose from "mongoose";
import {
  VALID_TASK_PRIORITIES,
  VALID_TASK_STATUSES,
  VALID_TASK_TYPES,
} from "../models/task-model.ts";

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
    const taskData: any = {
      task_name,
      description,
      due_date
      
    };

    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        !(VALID_TASK_STATUSES as readonly string[]).includes(status)
      ) {
        throw new AppError("Invalid status", 400);
      }
      taskData.status = status;
    }

    if (priority !== undefined) {
      if (
        typeof priority !== "string" ||
        !(VALID_TASK_PRIORITIES as readonly string[]).includes(priority)
      ) {
        throw new AppError("Invalid priority", 400);
      }
      taskData.priority = priority;
    }

    if (type !== undefined) {
      if (
        typeof type !== "string" ||
        !(VALID_TASK_TYPES as readonly string[]).includes(type)
      ) {
        throw new AppError("Invalid type", 400);
      }
      taskData.type = type;
    }

    if (assignee_id) {
      const user = await User.findById(assignee_id);
      if (!user) {
        throw new AppError("User Not Found", 400);
      }
      taskData.assignee_id = assignee_id;
    }

    // {
    //   assignee_id,
    //   task_name,
    //   description,
    //   status,
    //   priority,
    //   type,
    //   due_date,
    //   project_id: projectId,
    //   organization_id: organizationId,
    //   creator_id: userId,
    //   is_deleted: false,
    // }
    const newTask = await Task.create(taskData);

    res.status(200).json({
      message: "task has been created",
      data: newTask,
    });
  }
);

export const getTaskDetails = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const task = (req as any).task;
    await task.populate("assignee_id", "name");
    await task.populate("creator_id", "name");

    res.status(200).json({
      message: "Task data fetched",
      data: task,
    });
  }
);

export const getAllTask = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { projectId, organizationId } = req.params;
    const { status, priority, assignee_id, type } = req.query;

    // const page =

    const filter: Record<string, unknown> = {
      organization_id: organizationId,
      project_id: projectId,
      is_deleted: false,
    };
    const isValid = (id: unknown): id is string =>
      typeof id === "string" && mongoose.isValidObjectId(id);

    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        !(VALID_TASK_STATUSES as readonly string[]).includes(status)
      ) {
        throw new AppError("Invalid status", 400);
      }
      filter.status = status;
    }

    if (priority !== undefined) {
      if (
        typeof priority !== "string" ||
        !(VALID_TASK_PRIORITIES as readonly string[]).includes(priority)
      ) {
        throw new AppError("Invalid priority", 400);
      }
      filter.priority = priority;
    }

    if (type !== undefined) {
      if (
        typeof type !== "string" ||
        !(VALID_TASK_TYPES as readonly string[]).includes(type)
      ) {
        throw new AppError("Invalid type", 400);
      }
      filter.type = type;
    }

    if (assignee_id !== undefined) {
      if (!isValid(assignee_id)) {
        throw new AppError("Invalid assignee_id", 400);
      }
      filter.assignee_id = assignee_id;
    }

    const taskData = await Task.find(filter)
      .populate("assignee_id", "name")
      .populate("creator_id", "name")
      .lean();
    res.status(200).json({
      message: "All the task data fetched",
      data: taskData,
    });
  }
);

export const assignTask = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;
    const { assignee_id } = req.body;
    const task = (req as any).task;
    

    // null / undefined / "" => unassign
    if (
      assignee_id === null ||
      assignee_id === undefined ||
      assignee_id === ""
    ) {
      task.assignee_id = null as any;
      await task.save();
      const data = await Task.findById(task._id)
        .populate("assignee_id", "name")
        .populate("creator_id", "name");
      res.status(200).json({
        message: "Task unassigned successfully",
        data,
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(assignee_id)) {
      throw new AppError("Invalid assignee_id", 400);
    }

    const assignee = await User.findById(assignee_id);
    if (!assignee) {
      throw new AppError("Assignee user not found", 404);
    }

    const membership = await OrganizationMember.findOne({
      organization_id: organizationId,
      user_id: assignee_id,
    });
    if (!membership) {
      throw new AppError("Assignee must be a member of this organization", 400);
    }

    task.assignee_id = assignee_id;
    await task.save();
    const data = await Task.findById(task._id)
      .populate("assignee_id", "name")
      .populate("creator_id", "name");
    res.status(200).json({
      message: "Task assigned successfully",
      data,
    });
  }
);
