import { Label } from "../../../../../components/ui/Form/Form";
import type { ProjectSettingsProps } from "../../../types";

const PROJECT_PERMISSIONS: { title: string; body: string }[] = [
  {
    title: "Manage project",
    body: "Owners and admins can edit the project name and description. Members have read-only access to settings.",
  },
  {
    title: "Manage members",
    body: "Owners and admins can add workspace members to the project and remove them. Membership requires being part of the workspace first.",
  },
  {
    title: "Manage tasks",
    body: "Owners and admins can create, edit, move and delete tasks. Project members work on tasks assigned to them.",
  },
  {
    title: "Delete project",
    body: "Only owners and admins can permanently delete the project from the danger zone. This removes all of its tasks and cannot be undone.",
  },
];

const ProjectPermissions = (_props: ProjectSettingsProps) => {
  return (
    <>
      <Label className="title-sm">Roles &amp; permissions</Label>
      <p>What each workspace role can do inside this project.</p>
      <div className="permission-list">
        {PROJECT_PERMISSIONS.map((p) => (
          <div key={p.title}>
            <Label className="label-md">{p.title}</Label>
            <p>{p.body}</p>
          </div>
        ))}
      </div>
      <Label className="label-md">Role summary</Label>
      <div className="permission-list">
        <div>
          <Label className="label-md">Owner</Label>
          <p>
            Full control: project settings, members, tasks and delete project.
          </p>
        </div>
        <div>
          <Label className="label-md">Admin</Label>
          <p>Manage project settings, members and tasks. Same as owner.</p>
        </div>
        <div>
          <Label className="label-md">Member</Label>
          <p>
            Work on tasks in projects you belong to. Cannot access project
            settings or manage members.
          </p>
        </div>
      </div>
    </>
  );
};

export default ProjectPermissions;
