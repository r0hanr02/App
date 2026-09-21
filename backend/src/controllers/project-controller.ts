import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth-middleware.ts";
import type { OrganizationParams } from "./organization-controller.ts";
import mongoose from "mongoose";
import { Project, ProjectMember } from "../models/index.ts";

export const createProject = async (
  req: AuthenticatedRequest<OrganizationParams>,
  res: Response
) => {
  try {
    const { project_name } = req.body;
    const organization_id = req.params.organizationId;
    const user_id = req.user?.id;
    if (!project_name) {
      return res.status(400).json({
        message: "Check the response data properly!",
      });
    }
    const newProject = await Project.create({
      project_name,
      organization_id: organization_id!,
    });
    await ProjectMember.create({
      project_id: newProject._id,
      user_id,
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
