import express from "express";
import authMiddleware from "../middlewares/auth-middleware.ts";
import {
  addMember,
  changeMemberRole,
  createOrganization,
  getAllOrganization,
  getOrganization,
  getOrganizationMembers,
  leaveOrganization,
  removeMember,
  removeOrganization,
  updateOrganizationData,
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
router.get(
  "/organization/:organizationId/member",
  authMiddleware,
  requireOrganizationMember,
  getOrganizationMembers
);
router.delete(
  "/organization/:organizationId",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  removeOrganization
);
router.delete(
  "/organization/:organizationId/leave",
  authMiddleware,
  requireOrganizationMember,
  leaveOrganization
);
router.patch(
  "/organization/:organizationId/update",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER"),
  updateOrganizationData
);

//organization Member

router.post(
  "/organization/:organizationId/member",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  addMember
);

router.patch(
  "/organization/:organizationId/change-role",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER"),
  changeMemberRole
);
router.delete(
  "/organization/:organizationId/member/:userId",
  authMiddleware,
  requireOrganizationMember,
  requireOrganizationRole("OWNER", "ADMIN"),
  removeMember
);

export default router;

// ✅ POST organization
// ✅ GET all user's organizations
// ✅ GET one organization
// ✅ GET organization members
// ✅ POST member
// ✅ DELETE member
// ✅ DELETE organization
// ✅ LEAVE organization
// ✅ PATCH member role
// ✅ PATCH organization


// later
// ⬜ Invitations
// ⬜ Transfer ownership
// ⬜ Organization settings
