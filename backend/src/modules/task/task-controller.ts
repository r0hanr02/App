import type { Response } from "express";
import { asyncHandler } from "../../middlewares/error-middleware.ts";
import type { OrganizationParams } from "../organization/organization-controller.ts";
import type { AuthenticatedRequest } from "../../middlewares/auth-middleware.ts";
import type {
  CreateTaskInput,
  GetAllTaskInput,
  UpdateTaskInput,
} from "./task-services.ts";
import {
  assignTaskServices,
  createTaskServices,
  deleteTaskServices,
  getAllTaskServices,
  getTaskDetailsServices,
  updateTaskServices,
} from "./task-services.ts";

const getTask = (req: AuthenticatedRequest<OrganizationParams>) =>
  (req as any).task;

const getUserId = (req: AuthenticatedRequest<OrganizationParams>) =>
  (req as any).userId || (req as any).user?.id;

export const createTask = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId, projectId } = req.params;

    const newTask = await createTaskServices(
      organizationId!,
      projectId!,
      getUserId(req),
      req.body as CreateTaskInput
    );

    res.status(201).json({
      message: "Task created successfully",
      data: newTask,
    });
  }
);

export const getTaskDetails = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const task = await getTaskDetailsServices(getTask(req));

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

    const { data, pagination } = await getAllTaskServices(
      organizationId!,
      projectId!,
      { status, priority, assignee_id, type, search, page, limit } satisfies GetAllTaskInput
    );

    res.status(200).json({
      message: "All the task data fetched",
      data,
      pagination,
    });
  }
);

export const assignTask = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;
    const { assignee_id } = req.body;

    const { data, unassigned } = await assignTaskServices(
      organizationId!,
      getTask(req),
      assignee_id
    );

    res.status(200).json({
      message: unassigned
        ? "Task unassigned successfully"
        : "Task assigned successfully",
      data,
    });
  }
);

export const updateTask = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;

    const data = await updateTaskServices(
      organizationId!,
      getTask(req),
      req.body as UpdateTaskInput
    );

    res.status(200).json({
      message: "Task updated successfully",
      data,
    });
  }
);

export const deleteTask = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    await deleteTaskServices(getTask(req));

    res.status(200).json({
      message: "Task deleted successfully",
    });
  }
);
