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

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      throw new AppError("Invalid organization id", 400);
    }

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new AppError("Invalid project id", 400);
    }

    const userId = (req as any).userId || (req as any).user?.id;
    if (!userId) {
      throw new AppError("Unauthorized: User not authenticated", 401);
    }

    // task_name: required, trimmed non-empty, max 200 chars
    if (!task_name || typeof task_name !== "string" || !task_name.trim()) {
      throw new AppError("Task name is required", 400);
    }
    if (task_name.trim().length > 200) {
      throw new AppError("Task Name Cannot Exceed 200 Characters", 400);
    }

    // description: optional string, max 5000 chars
    if (description !== undefined && description !== null) {
      if (typeof description !== "string") {
        throw new AppError("Description must be a string", 400);
      }
      if (description.length > 5000) {
        throw new AppError("Description Cannot Exceed 5000 Characters", 400);
      }
    }

    const taskData: any = {
      task_name: task_name.trim(),
      description: description ?? "",
      creator_id: userId,
      organization_id: organizationId,
      project_id: projectId,
      is_deleted: false,
    };

    if (status !== undefined && status !== null && status !== "") {
      if (
        typeof status !== "string" ||
        !(VALID_TASK_STATUSES as readonly string[]).includes(status)
      ) {
        throw new AppError(
          `Status must be one of: ${VALID_TASK_STATUSES.join(", ")}`,
          400
        );
      }
      taskData.status = status;
    }

    if (priority !== undefined && priority !== null && priority !== "") {
      if (
        typeof priority !== "string" ||
        !(VALID_TASK_PRIORITIES as readonly string[]).includes(priority)
      ) {
        throw new AppError(
          `Priority must be one of: ${VALID_TASK_PRIORITIES.join(", ")}`,
          400
        );
      }
      taskData.priority = priority;
    }

    if (type !== undefined && type !== null && type !== "") {
      if (
        typeof type !== "string" ||
        !(VALID_TASK_TYPES as readonly string[]).includes(type)
      ) {
        throw new AppError(
          `Type must be one of: ${VALID_TASK_TYPES.join(", ")}`,
          400
        );
      }
      taskData.type = type;
    }

    // due_date: optional, must be a valid date; null/empty clears it
    if (due_date === undefined || due_date === null || due_date === "") {
      taskData.due_date = null;
    } else {
      const parsed = new Date(due_date);
      if (isNaN(parsed.getTime())) {
        throw new AppError("Invalid due date", 400);
      }
      taskData.due_date = parsed;
    }

    // assignee_id: optional; must be existing user + org member
    if (
      assignee_id === undefined ||
      assignee_id === null ||
      assignee_id === ""
    ) {
      taskData.assignee_id = null;
    } else {
      if (
        typeof assignee_id !== "string" ||
        !mongoose.Types.ObjectId.isValid(assignee_id)
      ) {
        throw new AppError("Invalid assignee id", 400);
      }
      const user = await User.findById(assignee_id);
      if (!user) {
        throw new AppError("Assignee user not found", 404);
      }
      const membership = await OrganizationMember.findOne({
        organization_id: organizationId,
        user_id: assignee_id,
      });
      if (!membership) {
        throw new AppError(
          "Assignee must be a member of this organization",
          400
        );
      }
      taskData.assignee_id = assignee_id;
    }

    const newTask = await Task.create(taskData);
    const populated = await Task.findById(newTask._id)
      .populate("assignee_id", "name")
      .populate("creator_id", "name");

    res.status(201).json({
      message: "Task created successfully",
      data: populated ?? newTask,
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
    const { status, priority, assignee_id, type, search, page, limit } =
      req.query;

    if (
      !organizationId ||
      !mongoose.Types.ObjectId.isValid(organizationId as string)
    ) {
      throw new AppError("Invalid organization id", 400);
    }

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId as string)) {
      throw new AppError("Invalid project id", 400);
    }

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
        throw new AppError(
          `Status must be one of: ${VALID_TASK_STATUSES.join(", ")}`,
          400
        );
      }
      filter.status = status;
    }

    if (priority !== undefined) {
      if (
        typeof priority !== "string" ||
        !(VALID_TASK_PRIORITIES as readonly string[]).includes(priority)
      ) {
        throw new AppError(
          `Priority must be one of: ${VALID_TASK_PRIORITIES.join(", ")}`,
          400
        );
      }
      filter.priority = priority;
    }

    if (type !== undefined) {
      if (
        typeof type !== "string" ||
        !(VALID_TASK_TYPES as readonly string[]).includes(type)
      ) {
        throw new AppError(
          `Type must be one of: ${VALID_TASK_TYPES.join(", ")}`,
          400
        );
      }
      filter.type = type;
    }

    if (assignee_id !== undefined) {
      if (!isValid(assignee_id)) {
        throw new AppError("Invalid assignee id", 400);
      }
      filter.assignee_id = assignee_id;
    }

    // search: optional case-insensitive match on task_name + description
    if (search !== undefined) {
      if (typeof search !== "string" || !search.trim()) {
        throw new AppError("Search must be a non-empty string", 400);
      }
      const trimmed = search.trim();
      if (trimmed.length > 100) {
        throw new AppError(
          "Search query too long, maximum 100 characters allowed",
          400
        );
      }
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      (filter as any).$or = [{ task_name: regex }, { description: regex }];
    }

    // pagination: ?page=&limit= (defaults 1 / 10, max limit 100)
    let currentPage = 1;
    let pageLimit = 10;
    if (page !== undefined) {
      currentPage = Number(page);
      if (!Number.isInteger(currentPage) || currentPage < 1) {
        throw new AppError("Invalid page number", 400);
      }
    }
    if (limit !== undefined) {
      pageLimit = Number(limit);
      if (!Number.isInteger(pageLimit) || pageLimit < 1) {
        throw new AppError("Invalid limit value", 400);
      }
      if (pageLimit > 100) {
        throw new AppError("Limit cannot exceed 100", 400);
      }
    }
    const skip = (currentPage - 1) * pageLimit;

    const [taskData, totalRecords] = await Promise.all([
      Task.find(filter)
        .populate("assignee_id", "name")
        .populate("creator_id", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      Task.countDocuments(filter),
    ]);
    const totalPages =
      totalRecords === 0 ? 0 : Math.ceil(totalRecords / pageLimit);

    res.status(200).json({
      message: "All the task data fetched",
      data: taskData,
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

export const assignTask = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;
    const { assignee_id } = req.body;
    const task = (req as any).task;

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

export const updateTask = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;
    const {
      task_name,
      description,
      status,
      priority,
      type,
      due_date,
      assignee_id,
    } = req.body;

    // Tenant-scoped + not-deleted task loaded by requireTaskAccess middleware.
    const task = (req as any).task;
    if (!task) {
      throw new AppError("Task not found", 404);
    }

    const hasUpdatableField =
      task_name !== undefined ||
      description !== undefined ||
      status !== undefined ||
      priority !== undefined ||
      type !== undefined ||
      due_date !== undefined ||
      assignee_id !== undefined;

    if (!hasUpdatableField) {
      throw new AppError("No valid fields provided for update", 400);
    }

    if (task_name !== undefined) {
      if (
        typeof task_name !== "string" ||
        !task_name.trim() ||
        task_name.trim().length > 200
      ) {
        throw new AppError(
          !task_name || typeof task_name !== "string" || !task_name.trim()
            ? "Task name is required"
            : "Task Name Cannot Exceed 200 Characters",
          400
        );
      }
      task.task_name = task_name.trim();
    }

    if (description !== undefined) {
      if (description !== null) {
        if (typeof description !== "string") {
          throw new AppError("Description must be a string", 400);
        }
        if (description.length > 5000) {
          throw new AppError("Description Cannot Exceed 5000 Characters", 400);
        }
      }
      task.description = description ?? "";
    }

    if (status !== undefined && status !== null && status !== "") {
      if (
        typeof status !== "string" ||
        !(VALID_TASK_STATUSES as readonly string[]).includes(status)
      ) {
        throw new AppError(
          `Status must be one of: ${VALID_TASK_STATUSES.join(", ")}`,
          400
        );
      }
      task.status = status;
    }

    if (priority !== undefined && priority !== null && priority !== "") {
      if (
        typeof priority !== "string" ||
        !(VALID_TASK_PRIORITIES as readonly string[]).includes(priority)
      ) {
        throw new AppError(
          `Priority must be one of: ${VALID_TASK_PRIORITIES.join(", ")}`,
          400
        );
      }
      task.priority = priority;
    }

    if (type !== undefined && type !== null && type !== "") {
      if (
        typeof type !== "string" ||
        !(VALID_TASK_TYPES as readonly string[]).includes(type)
      ) {
        throw new AppError(
          `Type must be one of: ${VALID_TASK_TYPES.join(", ")}`,
          400
        );
      }
      task.type = type;
    }

    if (due_date !== undefined) {
      if (due_date === null || due_date === "") {
        task.due_date = null;
      } else {
        const parsed = new Date(due_date);
        if (isNaN(parsed.getTime())) {
          throw new AppError("Invalid due date", 400);
        }
        task.due_date = parsed;
      }
    }

    if (assignee_id !== undefined) {
      if (assignee_id === null || assignee_id === "") {
        task.assignee_id = null;
      } else {
        if (
          typeof assignee_id !== "string" ||
          !mongoose.Types.ObjectId.isValid(assignee_id)
        ) {
          throw new AppError("Invalid assignee id", 400);
        }
        const user = await User.findById(assignee_id);
        if (!user) {
          throw new AppError("Assignee user not found", 404);
        }
        const membership = await OrganizationMember.findOne({
          organization_id: organizationId,
          user_id: assignee_id,
        });
        if (!membership) {
          throw new AppError(
            "Assignee must be a member of this organization",
            400
          );
        }
        task.assignee_id = assignee_id;
      }
    }

    await task.save();
    const data = await Task.findById(task._id)
      .populate("assignee_id", "name")
      .populate("creator_id", "name");

    res.status(200).json({
      message: "Task updated successfully",
      data,
    });
  }
);

export const deleteTask = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const task = (req as any).task;
    if (!task) {
      throw new AppError("Task not found", 404);
    }
    task.is_deleted = true;
    await task.save();

    res.status(200).json({
      message: "Task deleted successfully",
    });
  }
);
