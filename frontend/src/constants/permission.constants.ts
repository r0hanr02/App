export const PERMISSIONS: { title: string; body: string }[] = [
  {
    title: "Manage workspace",
    body: "Owners and admins can edit the workspace name, description and slug. Members have read-only access to settings.",
  },
  {
    title: "Manage members",
    body: "Owners and admins can add members (Admin or Member roles) and remove non-owners. Use Leave to remove yourself.",
  },
  {
    title: "Manage roles",
    body: "Only owners can promote members to admin or demote admins back to member. Ownership itself moves via Transfer ownership in the danger zone.",
  },
  {
    title: "Delete workspace",
    body: "Only owners can permanently delete the workspace. This removes all projects, tasks and memberships and cannot be undone.",
  },
];