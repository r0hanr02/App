/* Organization API types */

export type OrgRole = "OWNER" | "ADMIN" | "MEMBER";

export interface Organization {
  _id: string;
  organization_name: string;
  slug?: string;
  organization_description?: string;
  organization_logo?: string;
}

export interface OrgMemberUser {
  _id: string;
  name: string;
  email: string;
}

export interface OrgMember {
  _id: string;
  organization_id: string;
  user_id: OrgMemberUser | string;
  role: OrgRole;
}

export interface OrgResponse {
  message: string;
  data: Organization;
}

export interface MembersResponse {
  message: string;
  data: OrgMember[];
}

/* Notification preferences (localStorage-backed) */

export interface NotificationPrefs {
  taskAssigned: boolean;
  mentions: boolean;
  weeklyDigest: boolean;
}
