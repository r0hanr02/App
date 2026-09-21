import express from "express";
import authMiddleware from "../middlewares/auth-middleware.ts";
import { requireOrganizationMember } from "../middlewares/auth-organization-member.ts";
import { requireOrganizationRole } from "../middlewares/auth-required-role.ts";
import { createProject } from "../controllers/project-controller.ts";

const router = express.Router();

router.post(
  "/organization/:organizationId/project/create",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  createProject
);

export default router;


// Informational responses (100 – 199)
// Successful responses (200 – 299)
// Redirection messages (300 – 399)
// Client error responses (400 – 499)
// Server error responses (500 – 599)
