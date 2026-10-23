import mongoose from "mongoose";
import { AppError } from "../../middlewares/error-middleware.ts";
import { Task } from "./task-model.ts";
import { User } from "../auth/user-model.ts";
import { OrganizationMember } from "../organization/organization-model.ts";
import {
  VALID_TASK_PRIORITIES,
  VALID_TASK_STATUSES,
  VALID_TASK_TYPES,
} from "./task-model.ts";

export interface CreateTaskInput {
  task_name?: unknown;
  description?: unknown;
  status?: unknown;
  priority?: unknown;
  type?: unknown;
  due_date?: unknown;
  assignee_id?: unknown;
}

export interface UpdateTaskInput {
  task_name?: unknown;
  description?: unknown;
  status?: unknown;
  priority?: unknown;
  type?: unknown;
  due_date?: unknown;
  assignee_id?: unknown;
}

export interface GetAllTaskInput {
  status?: unknown;
  priority?: unknown;
  assignee_id?: unknown;
  type?: unknown;
  search?: unknown;
  page?: unknown;
  limit?: unknown;
}

export interface TaskPagination {
  currentPage: number;
  pageLimit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const isValidObjectId = (id: unknown): id is string =>
  typeof id === "string" && mongoose.isValidObjectId(id);

const requireValidObjectId = (value: unknown, message: string): string => {
  if (!value || !mongoose.Types.ObjectId.isValid(value as string)) {
    throw new AppError(message, 400);
  }
  return value as string;
};

const assertStatus = (status: unknown) => {
  if (typeof status !== "string" || !(VALID_TASK_STATUSES as readonly string[]).includes(status)) {
    throw new AppError(
      `Status must be one of: ${VALID_TASK_STATUSES.join(", ")}`,
      400
    );
  }
};

const assertPriority = (priority: unknown) => {
  if (typeof priority !== "string" || !(VALID_TASK_PRIORITIES as readonly string[]).includes(priority)) {
    throw new AppError(
      `Priority must be one of: ${VALID_TASK_PRIORITIES.join(", ")}`,
      400
    );
  }
};

const assertType = (type: unknown) => {
  if (typeof type !== "string" || !(VALID_TASK_TYPES as readonly string[]).includes(type)) {
    throw new AppError(
      `Type must be one of: ${VALID_TASK_TYPES.join(", ")}`,
      400
    );
  }
};

const parseDueDate = (due_date: unknown): Date | null => {
  if (due_date === undefined || due_date === null || due_date === "") {
    return null;
  }
  const parsed = new Date(due_date as string);
  if (isNaN(parsed.getTime())) {
    throw new AppError("Invalid due date", 400);
  }
  return parsed;
};

const assertAssignee = async (
  assignee_id: unknown,
  organizationId: string
): Promise<string | null> => {
  if (assignee_id === undefined || assignee_id === null || assignee_id === "") {
    return null;
  }

  if (typeof assignee_id !== "string" || !mongoose.Types.ObjectId.isValid(assignee_id)) {
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
  return assignee_id;
};

const populateTask = async (taskId: unknown) =>
  Task.findById(taskId)
    .populate("assignee_id", "name")
    .populate("creator_id", "name");

export const createTaskServices = async (
  organizationId: string,
  projectId: string,
  userId: unknown,
  input: CreateTaskInput
) => {
  const {
    task_name,
    description,
    status,
    priority,
    type,
    due_date,
    assignee_id,
  } = input;

  requireValidObjectId(organizationId, "Invalid organization id");
  requireValidObjectId(projectId, "Invalid project id");

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
    assertStatus(status);
    taskData.status = status;
  }

  if (priority !== undefined && priority !== null && priority !== "") {
    assertPriority(priority);
    taskData.priority = priority;
  }

  if (type !== undefined && type !== null && type !== "") {
    assertType(type);
    taskData.type = type;
  }

  taskData.due_date = parseDueDate(due_date);

  taskData.assignee_id = await assertAssignee(assignee_id, organizationId);

  const newTask = await Task.create(taskData);
  const populated = await populateTask(newTask._id);

  return populated ?? newTask;
};

export const getTaskDetailsServices = async (task: any) => {
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  await task.populate("assignee_id", "name");
  await task.populate("creator_id", "name");
  return task;
};

export const getAllTaskServices = async (
  organizationId: string,
  projectId: string,
  query: GetAllTaskInput
) => {
  const { status, priority, assignee_id, type, search, page, limit } = query;

  requireValidObjectId(organizationId, "Invalid organization id");
  requireValidObjectId(projectId, "Invalid project id");

  const filter: Record<string, unknown> = {
    organization_id: organizationId,
    project_id: projectId,
    is_deleted: false,
  };

  if (status !== undefined) {
    assertStatus(status);
    filter.status = status;
  }

  if (priority !== undefined) {
    assertPriority(priority);
    filter.priority = priority;
  }

  if (type !== undefined) {
    assertType(type);
    filter.type = type;
  }

  if (assignee_id !== undefined) {
    if (!isValidObjectId(assignee_id)) {
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

  return {
    data: taskData,
    pagination: {
      currentPage,
      pageLimit,
      totalRecords,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    } satisfies TaskPagination,
  };
};

export const assignTaskServices = async (
  organizationId: string,
  task: any,
  assignee_id: unknown
) => {
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (assignee_id === null || assignee_id === undefined || assignee_id === "") {
    task.assignee_id = null as any;
    await task.save();
    const data = await populateTask(task._id);
    return { data, unassigned: true };
  }

  const normalizedAssignee = await assertAssignee(assignee_id, organizationId);

  task.assignee_id = normalizedAssignee;
  await task.save();
  const data = await populateTask(task._id);
  return { data, unassigned: false };
};

export const updateTaskServices = async (
  organizationId: string,
  task: any,
  input: UpdateTaskInput
) => {
  const {
    task_name,
    description,
    status,
    priority,
    type,
    due_date,
    assignee_id,
  } = input;

  // Tenant-scoped + not-deleted task loaded by requireTaskAccess middleware.
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
    assertStatus(status);
    task.status = status;
  }

  if (priority !== undefined && priority !== null && priority !== "") {
    assertPriority(priority);
    task.priority = priority;
  }

  if (type !== undefined && type !== null && type !== "") {
    assertType(type);
    task.type = type;
  }

  if (due_date !== undefined) {
    task.due_date = parseDueDate(due_date);
  }

  if (assignee_id !== undefined) {
    if (assignee_id === null || assignee_id === "") {
      task.assignee_id = null;
    } else {
      const normalizedAssignee = await assertAssignee(
        assignee_id,
        organizationId
      );
      task.assignee_id = normalizedAssignee;
    }
  }

  await task.save();
  const data = await populateTask(task._id);

  return data;
};

export const deleteTaskServices = async (task: any) => {
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  task.is_deleted = true;
  await task.save();
};
