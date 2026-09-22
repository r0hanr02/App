import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.ts";
import type { OrganizationParams } from "./organization-controller.ts";
import { Project, ProjectMember } from "../models/index.ts";

export const createProject = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const { project_name } = req.body;
    const organization_id = req.params.organizationId;
    if (!project_name) {
      return res.status(400).json({
        message: "Check the response data properly!",
      });
    }
    const newProject = await Project.create({
      project_name,
      organization_id: organization_id,
    });
    const userId = req.user?.id;

    await ProjectMember.create({
      project_id: newProject._id,
      user_id: userId,
    });

    return res.status(200).json({
      message: "Project Created Successfully",
      data: newProject,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAllProject = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const organizationId = req.params.organizationId;

    const allProjects = await Project.find({
      organization_id: organizationId,
    });
    // .populate("organization_id","organization_name");
    return res.status(200).json({
      message: "All projects data has been fetch",
      data: allProjects,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getProject = async (
  req: AuthenticatedRequest<OrganizationParams & { projectId?: string }>,
  res: Response
) => {
  try {
    const { projectId } = req.params as { projectId: string };
    if (!req.projectMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    return res.status(200).json({
      message: "Project fetched successfully",
      data: project,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateProject = async (
  req: AuthenticatedRequest<OrganizationParams & { projectId?: string }>,
  res: Response
) => {
  try {
    const { project_name } = req.body;
    const { projectId } = req.params as { projectId: string };
    if (!project_name) {
      return res.status(400).json({
        message: "Check the Project Name Properly",
      });
    }

    await Project.findByIdAndUpdate(projectId, {
      project_name,
    });
    return res.status(200).json({
      message: "Project Name has been Updated",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
