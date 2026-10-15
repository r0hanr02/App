import type { LucideIcon } from "lucide-react";

/* Organization membership API types */

export type UserOrgMembership = {
  _id: string;
  organization_id: {
    organization_name: string;
    _id: string;
    slug: string;
  };
  user_id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  updatedAt: string;
};

export type org_response = {
  message: string;
  data: UserOrgMembership[];
};

export interface CreateOrganizationResponse {
  message: string;
  data: {
    organization_name: string;
    organization_logo: string;
    organization_description: string;
    slug: string;
    _id: string;
  };
}

/* Dashboard activity chart types */

export interface ActivityPoint {
  key: string;
  day: string;
  created: number;
  completed: number;
}

/* NoOrgCard component props */

export interface NoOrgCardProps {
  logo: LucideIcon | React.ReactNode;
  title: string;
  subheading: string;
  btnText: string;
  btnOnclick: () => void;
  btnVariant: "primary" | "secondary" | "outline" | "ghost" | "danger";
  btnlogo?: LucideIcon | React.ReactNode;
  note: string;
}
