import { Label } from "../../../components/ui/Form/Form";
import { PERMISSIONS } from "../../../constants/permission.constants";

const RolesAndPermission = () => {
  return (
    <>
      <Label className="title-sm">Roles &amp; permissions</Label>
      <p>What each workspace role is allowed to do.</p>
      <div className="permission-list">
        {PERMISSIONS.map((p) => (
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
            Full control: settings, members, roles, transfer ownership, delete
            workspace.
          </p>
        </div>
        <div>
          <Label className="label-md">Admin</Label>
          <p>
            Manage settings and members. Cannot change roles to admin, transfer
            ownership, or delete the workspace.
          </p>
        </div>
        <div>
          <Label className="label-md">Member</Label>
          <p>
            Work in projects and tasks. Cannot access workspace settings or
            manage members.
          </p>
        </div>
      </div>
    </>
  );
};

export default RolesAndPermission;
