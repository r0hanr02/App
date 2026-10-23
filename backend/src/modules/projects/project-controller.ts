import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middlewares/auth-middleware.ts";
import type { OrganizationParams } from "../organization/organization-controller.ts";
import { asyncHandler } from "../../middlewares/error-middleware.ts";
import type {
  CreateProjectInput,
  GetAllProjectInput,
} from "./project-services.ts";
import {
  addMemberInProjectServices,
  createProjectServices,
  deleteProjectServices,
  getAllMemberInProjectServices,
  getAllProjectServices,
  getProjectServices,
  removeMemberFromProjectServices,
  updateProjectServices,
} from "./project-services.ts";

const getOrgId = (req: AuthenticatedRequest<OrganizationParams>) =>
  (req.params as any).organizationId as string;

const getUserId = (req: AuthenticatedRequest<any>) =>
  (req as any).userId || (req as any).user?.id || (req as any).user?._id;

export const createProject = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { project_name, project_description } = req.body;

    const newProject = await createProjectServices(
      getUserId(req),
      getOrgId(req),
      { project_name, project_description } satisfies CreateProjectInput
    );

    res.status(201).json({
      message: "Project Created Successfully",
      data: newProject,
    });
  }
);

export const getAllProject = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const organizationId = getOrgId(req);
    const { search, page, limit, sort } = req.query;

    const { data, pagination } = await getAllProjectServices(
      getUserId(req),
      organizationId,
      (req as any).organizationMember?.role,
      { search, page, limit, sort } satisfies GetAllProjectInput
    );

    res.status(200).json({
      message: "All projects data has been fetch",
      data,
      pagination,
    });
  }
);

export const getProject = asyncHandler(
  async (
    req: AuthenticatedRequest<OrganizationParams & { projectId?: string }>,
    res: Response
  ) => {
    const { projectId } = req.params as { projectId: string };

    const project = await getProjectServices(projectId, getOrgId(req), {
      userId: getUserId(req),
      projectMember: (req as any).projectMember,
      orgRole: (req as any).organizationMember?.role,
    });

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

    const project = await updateProjectServices(
      projectId,
      getOrgId(req),
      project_name
    );

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

    const newMember = await addMemberInProjectServices(
      organizationId!,
      projectId!,
      user_id
    );

    return res.status(201).json({
      message: "User Added Successfully",
      data: newMember,
    });
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

    const members = await getAllMemberInProjectServices(
      organizationId!,
      projectId!
    );

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

    await removeMemberFromProjectServices(
      organizationId,
      projectId,
      userId
    );

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

    await deleteProjectServices(organizationId, projectId);

    return res.status(200).json({
      message: "Project deleted successfully",
    });
  }
);
