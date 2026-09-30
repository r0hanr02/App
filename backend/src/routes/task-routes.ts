import express from "express";
import authMiddleware from "../middlewares/auth-middleware.ts";
import { requireOrganizationMember } from "../middlewares/auth-organization-member.ts";
import { requireOrganizationRole } from "../middlewares/auth-required-role.ts";
import { requireProjectAccess } from "../middlewares/auth-project-member.ts";
import { requireTaskAccess } from "../middlewares/auth-task-access.ts";
import {
  assignTask,
  createTask,
  deleteTask,
  getAllTask,
  getTaskDetails,
  updateTask,
} from "../controllers/task-controller.ts";

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
  requireTaskAccess,
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

router.patch(
  "/organization/:organizationId/projects/:projectId/tasks/:taskId/assign",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  requireProjectAccess,
  requireTaskAccess,
  assignTask
);

router.patch(
  "/organization/:organizationId/projects/:projectId/tasks/:taskId",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  requireProjectAccess,
  requireTaskAccess,
  updateTask
);

router.delete(
  "/organization/:organizationId/projects/:projectId/tasks/:taskId",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  requireProjectAccess,
  requireTaskAccess,
  deleteTask
);

export default router;
