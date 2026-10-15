/* ------------------------------------------------------------------ */
/* Home dummy data — UI only, no API calls.                            */
/* Replace these exports with real API hooks when backend is ready.    */
/* ------------------------------------------------------------------ */

import type {
  DashboardProject,
  DashboardTask,
  DashboardTaskPriority,
  DashboardTaskStatus,
  DummyOrganization,
  DummyUser,
  OrgMember,
  PopulatedUser,
  TaskSeed,
} from "../types/dashboard.types";

export type {
  DashboardProject,
  DashboardTask,
  DashboardTaskPriority,
  DashboardTaskStatus,
  DummyOrganization,
  DummyUser,
  OrgMember,
  OrgMemberUser,
  PopulatedUser,
} from "../types/dashboard.types";

/* ------------------------------- helpers ------------------------------ */

const isoDaysFromNow = (days: number, hour = 9): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const isoHoursAgo = (hours: number): string => {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
};

/* --------------------------------- user ------------------------------- */

export const DUMMY_USER: DummyUser = {
  id: "user-1",
  name: "Alex Morgan",
  email: "alex@orbit.test",
};

/* ----------------------------- organizations -------------------------- */

export const DUMMY_ORGANIZATIONS: DummyOrganization[] = [
  {
    _id: "membership-1",
    organization_id: {
      organization_name: "Orbit Studio",
      _id: "org-1",
    },
    user_id: "user-1",
    role: "OWNER",
    createdAt: isoDaysFromNow(-90),
    updatedAt: isoDaysFromNow(-1),
  },
];

export const DUMMY_ACTIVE_ORG = DUMMY_ORGANIZATIONS[0];
export const DUMMY_ACTIVE_ORG_ID = DUMMY_ACTIVE_ORG.organization_id._id;
export const DUMMY_ORG_NAME = DUMMY_ACTIVE_ORG.organization_id.organization_name;

/* -------------------------------- projects ---------------------------- */

export const DUMMY_PROJECTS: DashboardProject[] = [
  {
    _id: "project-1",
    project_name: "Website Redesign",
    organization_id: "org-1",
    createdAt: isoDaysFromNow(-30),
    updatedAt: isoDaysFromNow(-1),
  },
  {
    _id: "project-2",
    project_name: "Mobile App",
    organization_id: "org-1",
    createdAt: isoDaysFromNow(-20),
    updatedAt: isoDaysFromNow(-2),
  },
  {
    _id: "project-3",
    project_name: "Marketing Launch",
    organization_id: "org-1",
    createdAt: isoDaysFromNow(-10),
    updatedAt: isoDaysFromNow(0),
  },
];

/* -------------------------------- members ----------------------------- */

const member = (
  id: string,
  userId: string,
  name: string,
  email: string,
  role: OrgMember["role"] = "MEMBER",
): OrgMember => ({
  _id: id,
  organization_id: "org-1",
  user_id: { _id: userId, name, email },
  role,
  createdAt: isoDaysFromNow(-30),
  updatedAt: isoDaysFromNow(-1),
});

export const DUMMY_MEMBERS: OrgMember[] = [
  member("member-1", "user-1", "Alex Morgan", "alex@orbit.test", "OWNER"),
  member("member-2", "user-2", "Sam Rivera", "sam@orbit.test", "ADMIN"),
  member("member-3", "user-3", "Jordan Lee", "jordan@orbit.test"),
  member("member-4", "user-4", "Taylor Kim", "taylor@orbit.test"),
];

/* --------------------------------- tasks ------------------------------ */

const seed = (s: TaskSeed): DashboardTask => ({
  _id: s.id,
  task_name: s.name,
  status: s.status,
  priority: s.priority,
  due_date: s.dueInDays === null ? null : isoDaysFromNow(s.dueInDays, 17),
  project_id: s.projectId,
  projectName: s.projectName,
  organization_id: "org-1",
  creator_id: { _id: "user-1", name: "Alex Morgan" },
  assignee_id: s.assignee,
  createdAt: isoDaysFromNow(-s.createdDaysAgo),
  updatedAt: isoHoursAgo(s.updatedHoursAgo),
});

const ALEX: PopulatedUser = { _id: "user-1", name: "Alex Morgan" };
const SAM: PopulatedUser = { _id: "user-2", name: "Sam Rivera" };
const JORDAN: PopulatedUser = { _id: "user-3", name: "Jordan Lee" };
const TAYLOR: PopulatedUser = { _id: "user-4", name: "Taylor Kim" };

export const DUMMY_TASKS: DashboardTask[] = [
  seed({
    id: "task-1",
    name: "Design homepage hero",
    status: "IN_PROGRESS",
    priority: "High",
    projectId: "project-1",
    projectName: "Website Redesign",
    assignee: ALEX,
    dueInDays: 1,
    createdDaysAgo: 2,
    updatedHoursAgo: 3,
  }),
  seed({
    id: "task-2",
    name: "Fix mobile nav overlap",
    status: "TODO",
    priority: "Medium",
    projectId: "project-1",
    projectName: "Website Redesign",
    assignee: ALEX,
    dueInDays: 3,
    createdDaysAgo: 1,
    updatedHoursAgo: 5,
  }),
  seed({
    id: "task-3",
    name: "Write launch announcement",
    status: "IN_REVIEW",
    priority: "Medium",
    projectId: "project-3",
    projectName: "Marketing Launch",
    assignee: ALEX,
    dueInDays: -1,
    createdDaysAgo: 4,
    updatedHoursAgo: 10,
  }),
  seed({
    id: "task-4",
    name: "Set up push notifications",
    status: "TODO",
    priority: "Critical",
    projectId: "project-2",
    projectName: "Mobile App",
    assignee: ALEX,
    dueInDays: -2,
    createdDaysAgo: 6,
    updatedHoursAgo: 26,
  }),
  seed({
    id: "task-5",
    name: "QA onboarding flow",
    status: "DONE",
    priority: "High",
    projectId: "project-2",
    projectName: "Mobile App",
    assignee: ALEX,
    dueInDays: -3,
    createdDaysAgo: 5,
    updatedHoursAgo: 20,
  }),
  seed({
    id: "task-6",
    name: "Update pricing page copy",
    status: "DONE",
    priority: "Low",
    projectId: "project-3",
    projectName: "Marketing Launch",
    assignee: SAM,
    dueInDays: -1,
    createdDaysAgo: 3,
    updatedHoursAgo: 8,
  }),
  seed({
    id: "task-7",
    name: "Prototype settings screen",
    status: "IN_PROGRESS",
    priority: "Medium",
    projectId: "project-2",
    projectName: "Mobile App",
    assignee: SAM,
    dueInDays: 2,
    createdDaysAgo: 1,
    updatedHoursAgo: 2,
  }),
  seed({
    id: "task-8",
    name: "Collect beta feedback",
    status: "TODO",
    priority: "Low",
    projectId: "project-3",
    projectName: "Marketing Launch",
    assignee: JORDAN,
    dueInDays: 5,
    createdDaysAgo: 0,
    updatedHoursAgo: 1,
  }),
  seed({
    id: "task-9",
    name: "Migrate analytics events",
    status: "IN_REVIEW",
    priority: "High",
    projectId: "project-1",
    projectName: "Website Redesign",
    assignee: TAYLOR,
    dueInDays: 0,
    createdDaysAgo: 6,
    updatedHoursAgo: 50,
  }),
  seed({
    id: "task-10",
    name: "Archive old brand assets",
    status: "CANCELLED",
    priority: "Low",
    projectId: "project-1",
    projectName: "Website Redesign",
    assignee: null,
    dueInDays: null,
    createdDaysAgo: 8,
    updatedHoursAgo: 100,
  }),
  seed({
    id: "task-11",
    name: "Draft release notes",
    status: "TODO",
    priority: "Medium",
    projectId: "project-2",
    projectName: "Mobile App",
    assignee: JORDAN,
    dueInDays: 4,
    createdDaysAgo: 0,
    updatedHoursAgo: 4,
  }),
  seed({
    id: "task-12",
    name: "Review accessibility audit",
    status: "DONE",
    priority: "Medium",
    projectId: "project-1",
    projectName: "Website Redesign",
    assignee: TAYLOR,
    dueInDays: -5,
    createdDaysAgo: 7,
    updatedHoursAgo: 30,
  }),
];
