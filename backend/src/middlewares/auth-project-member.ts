import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth-middleware";
import { ProjectMember } from "../models/index.ts";

export const requireProjectMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const membership = await ProjectMember.findOne({
      project_id: req.params.projectId,
      user_id: req.userId,
    });
    req.projectMember = membership;
    next();
  } catch (error) {
    return res.status(500).json(error);
  }
};
