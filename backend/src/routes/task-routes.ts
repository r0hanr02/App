import express from "express";
import authMiddleware from "../middlewares/auth-middleware.ts";
import { requireOrganizationMember } from "../middlewares/auth-organization-member.ts";
import { requireOrganizationRole } from "../middlewares/auth-required-role.ts";
import { requireProjectAccess } from "../middlewares/auth-project-member.ts";
import { createTask, getAllTask, getTaskDetails } from "../controllers/task-controller.ts";

const router = express.Router();
router.post(
  "/organization/:organizationId/projects/:projectId/tasks",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  requireProjectAccess,
  createTask
);

router.get(
  "/organization/:organizationId/projects/:projectId/tasks/:taskId",
  authMiddleware,
  requireOrganizationMember,
//   requireOrganizationRole("OWNER", "ADMIN"),
  requireProjectAccess,
  getTaskDetails
);

router.get(
  "/organization/:organizationId/projects/:projectId/tasks",
  authMiddleware,
  requireOrganizationMember,
//   requireOrganizationRole("OWNER", "ADMIN"),
  requireProjectAccess,
  getAllTask
);

export default router;
