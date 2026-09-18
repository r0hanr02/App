import express from "express";
import authMiddleware from "../middlewares/auth-middleware.ts";
import {
  addMember,
  createOrganization,
  getAllOrganization,
  getOrganization,
  removeMember,
} from "../controllers/organization-controller.ts";
import { requireOrganizationMember } from "../middlewares/auth-organization-member.ts";
import { requireOrganizationRole } from "../middlewares/auth-required-role.ts";

const router = express.Router();

router.post("/organization", authMiddleware, createOrganization);
router.get("/organization", authMiddleware, getAllOrganization);
router.get(
  "/organization/:organizationId",
  authMiddleware,
  requireOrganizationMember,
  getOrganization
);

//organization MEmber

router.post(
  "/organization/:organizationId/member",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  addMember
);
router.delete(
  "/organization/:organizationId/member/:userId",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  removeMember
);

export default router;
