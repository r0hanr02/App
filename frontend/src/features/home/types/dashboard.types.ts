/* Dashboard domain types (dummy data today, real API hooks later). */

export type DashboardTaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "CANCELLED";

export type DashboardTaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface DashboardProject {
  _id: string;
  project_name: string;
  organization_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PopulatedUser {
  _id: string;
  name: string;
  email?: string;
}

export interface DashboardTask {
  _id: string;
  task_name: string;
  description?: string;
  status: DashboardTaskStatus;
  priority: DashboardTaskPriority;
  type?: string;
  due_date: string | null;
  project_id: string | { _id: string; project_name?: string };
  organization_id: string;
  creator_id: PopulatedUser | string | null;
  assignee_id: PopulatedUser | string | null;
  createdAt: string;
  updatedAt: string;
  /** Client-side join: resolved from the projects list. */
  projectName?: string;
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
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt?: string;
  updatedAt?: string;
}

export interface DummyOrganization {
  _id: string;
  organization_id: {
    organization_name: string;
    _id: string;
  };
  user_id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  createdAt: string;
  updatedAt: string;
}

export interface DummyUser {
  id: string;
  name: string;
  email: string;
}

export interface TaskSeed {
  id: string;
  name: string;
  status: DashboardTaskStatus;
  priority: DashboardTaskPriority;
  projectId: string;
  projectName: string;
  assignee: PopulatedUser | null;
  dueInDays: number | null;
  createdDaysAgo: number;
  updatedHoursAgo: number;
}
