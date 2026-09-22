import express from "express";
import authMiddleware from "../middlewares/auth-middleware.ts";
import { requireOrganizationMember } from "../middlewares/auth-organization-member.ts";
import { requireOrganizationRole } from "../middlewares/auth-required-role.ts";
import {
  createProject,
  getAllProject,
  getProject,
  updateProject,
} from "../controllers/project-controller.ts";
import { requireProjectMember } from "../middlewares/auth-project-member.ts";

const router = express.Router();

router.post(
  "/organization/:organizationId/project/create",
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
  requireOrganizationRole("OWNER", "ADMIN"),
  requireProjectMember,
  getProject
);

router.patch(
  "/organization/:organizationId/projects/:projectId/update",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  // requireProjectMember,
  updateProject
);


export default router;

// Informational responses (100 – 199)
// Successful responses (200 – 299)
// Redirection messages (300 – 399)
// Client error responses (400 – 499)
// Server error responses (500 – 599)

// Projects
// │
// ├── POST   /organizations/:organizationId/projects
// ├── GET    /organizations/:organizationId/projects //get all project of the organization
// ├── GET    /organizations/:organizationId/projects/:projectId //get specific project of that organization
// ├── PATCH  /organizations/:organizationId/projects/:projectId
// └── DELETE /organizations/:organizationId/projects/:projectId

// Project Members
// │
// ├── GET    /organizations/:organizationId/projects/:projectId/members
//get all member who is working on this project
// ├── POST   /organizations/:organizationId/projects/:projectId/members
//add a user in the Project
{
  // later update
  // ├── PATCH  /organizations/:organizationId/projects/:projectId/members/:userId
  //Modify information about that user's membership in the project.
}
// └── DELETE /organizations/:organizationId/projects/:projectId/members/:userId
//Remove a user from a specific project.
