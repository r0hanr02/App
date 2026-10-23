import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middlewares/auth-middleware";
import { asyncHandler } from "../../middlewares/error-middleware";
import type {
  AddMemberInput,
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "./organization-services.ts";
import {
  addMemberServices,
  changeMemberRoleServices,
  createOrganizationServices,
  deleteOrganizationServices,
  getAllOrganizationServices,
  getOrganizationMembersServices,
  getOrganizationServices,
  leaveOrganizationServices,
  removeMemberServices,
  transferOwnershipServices,
  updateOrganizationDataServices,
} from "./organization-services.ts";

export interface OrganizationParams {
  organizationId?: string;
  userId?: string;
  projectId?: string;
  taskId?:string
}

const getUserId = (req: AuthenticatedRequest<any>) =>
  (req as any).userId || (req as any).user?.id;

const logoUrlFrom = (
  req: AuthenticatedRequest<any>,
  bodyLogo: unknown
): string | undefined => {
  const uploadedLogoPath = (req.file as Express.Multer.File | undefined)?.path;
  const normalizedBodyLogo =
    typeof bodyLogo === "string" && bodyLogo.trim()
      ? bodyLogo.trim()
      : undefined;

  return uploadedLogoPath ?? normalizedBodyLogo;
};

export const createOrganization = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organization_name, slug, organization_description, organization_logo } =
      req.body;

    const organization = await createOrganizationServices(getUserId(req), {
      organization_name,
      slug,
      organization_description,
      organization_logo: logoUrlFrom(req, organization_logo),
    } satisfies CreateOrganizationInput);

    res.status(201).json({
      message: "Organization created Successfully",
      data: organization,
    });
  }
);

export const getAllOrganization = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const memberships = await getAllOrganizationServices(getUserId(req));

    res.status(200).json({
      message: "data fetched Successfully",
      data: memberships,
    });
  }
);

export const getOrganization = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;

    const organization = await getOrganizationServices(organizationId!);

    res.status(200).json({
      message: "data fetched Successfully",
      data: organization,
    });
  }
);

export const getOrganizationMembers = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;

    const organizationMember = await getOrganizationMembersServices(
      organizationId!
    );

    res.status(200).json({
      message: "All Organization Member Data fetched.",
      data: organizationMember,
    });
  }
);

export const leaveOrganization = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;

    await leaveOrganizationServices(getUserId(req), organizationId!);

    res.status(200).json({
      message: "You've left the Organization",
    });
  }
);

export const deleteOrganization = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;

    await deleteOrganizationServices(organizationId!);

    res.status(200).json({
      message: "Organization Deleted Successfully.",
    });
  }
);

export const updateOrganizationData = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;
    const {
      organization_name,
      slug,
      organization_description,
      organization_logo,
    } = req.body;

    const updated = await updateOrganizationDataServices(organizationId!, {
      organization_name,
      slug,
      organization_description,
      // Multer file (field `organization_logo`) takes precedence over body URL string.
      organization_logo: logoUrlFrom(req, organization_logo),
    } satisfies UpdateOrganizationInput);

    res.status(200).json({
      message: "Organization data has been changed.",
      data: updated,
    });
  }
);

//Organization Member

export const addMember = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { user_id, role } = req.body;
    const { organizationId } = req.params;

    const member = await addMemberServices(
      organizationId!,
      { user_id, role } satisfies AddMemberInput,
      (req as any).organizationMember?.role
    );

    res.status(201).json({
      message: "User added successfully",
      data: member,
    });
  }
);

export const changeMemberRole = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { role } = req.body;
    const { organizationId, userId } = req.params as any;

    const targetMembership = await changeMemberRoleServices(
      organizationId,
      userId,
      role,
      (req as any).organizationMember?.role
    );

    res.status(200).json({
      message: "Role has been changed for the user",
      data: targetMembership,
    });
  }
);

export const removeMember = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId, userId } = req.params;

    await removeMemberServices(
      organizationId!,
      userId!,
      ((req as any).userId?.toString() || (req as any).user?.id) as string
    );

    res.status(200).json({
      message: "User removed successfully",
    });
  }
);

export const transferOwnership = asyncHandler(
  async (req: AuthenticatedRequest<OrganizationParams>, res: Response) => {
    const { organizationId } = req.params;
    const { targetUserId, user_id } = req.body;

    const data = await transferOwnershipServices(
      organizationId!,
      ((req as any).userId || (req as any).user?.id)?.toString(),
      targetUserId || user_id
    );

    res.status(200).json({
      message: "Ownership transferred successfully",
      data,
    });
  }
);
