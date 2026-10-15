import type { Organization, OrgMember } from "../../settings/types";

/* Organization projects API types */

export interface OrgProject {
  _id: string;
  project_name: string;
  organization_id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectsResponse {
  message: string;
  data: OrgProject[];
  pagination?: {
    currentPage: number;
    pageLimit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/* Organization component props */

export interface OrganizationHeroProps {
  org: Organization;
  role: string;
  orgSlug: string | null;
}

export interface OrganizationDetailsProps {
  org: Organization;
  role: string;
  memberCount: number;
}

export interface OrganizationMetricsProps {
  memberCount: number;
  projectCount: number;
  role: string;
  orgSlug: string | null;
}

export interface OrganizationPeopleProps {
  members: OrgMember[];
  canInvite: boolean;
  orgSlug: string | null;
  onInvite: () => void;
}

export interface OrganizationProjectsProps {
  projects: OrgProject[];
  orgSlug: string | null;
}

export interface InviteMemberDialogProps {
  orgId: string | null;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
}
