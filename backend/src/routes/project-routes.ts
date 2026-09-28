import express from "express";
import authMiddleware from "../middlewares/auth-middleware.ts";
import { requireOrganizationMember } from "../middlewares/auth-organization-member.ts";
import { requireOrganizationRole } from "../middlewares/auth-required-role.ts";
import {
  addMemberInProject,
  createProject,
  getAllProject,
  getProject,
  updateProject,
  getAllMemberInProject,
  removeMemberFromProject,
  deleteProject,
} from "../controllers/project-controller.ts";
import { requireProjectAccess } from "../middlewares/auth-project-member.ts";

const router = express.Router();

router.post(
  "/organization/:organizationId/projects",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  createProject
);

router.get(
  "/organization/:organizationId/projects",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  // requireProjectMember,
  getAllProject
);

router.get(
  "/organization/:organizationId/projects/:projectId",
  authMiddleware,
  requireOrganizationMember,
  requireProjectAccess,
  getProject
);

router.patch(
  "/organization/:organizationId/projects/:projectId",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  // requireProjectMember,
  updateProject
);

// Project Member

router.post(
  "/organization/:organizationId/projects/:projectId/members",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  requireProjectAccess,
  addMemberInProject
);

router.get(
  "/organization/:organizationId/projects/:projectId/members",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  requireProjectAccess,
  getAllMemberInProject
);

router.delete(
  "/organization/:organizationId/projects/:projectId/members/:userId",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  requireProjectAccess,
  removeMemberFromProject
);

router.delete(
  "/organization/:organizationId/projects/:projectId",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER"),
  requireProjectAccess,
  deleteProject
);

export default router;