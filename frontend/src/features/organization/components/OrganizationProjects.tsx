import { ArrowRight, Folder } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getRoutePath } from "../../../factories/RouteFactory";
import type { OrgProject } from "../api/organization.api";

interface Props {
  projects: OrgProject[];
  orgSlug: string | null;
}

function formatDate(iso?: string): string {
  if (!iso) return "No date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "No date";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const OrganizationProjects = ({ projects, orgSlug }: Props) => {
  return (
    <section className="panel account-section">
      <div className="section-heading">
        <h2 className="label-md">
          Projects{" "}
          <span
            className="count-pill"
            aria-label={`${projects.length} projects`}
          >
            {projects.length}
          </span>
        </h2>
        {orgSlug && (
          <Link
            to={getRoutePath("PROJECTS") as never}
            params={{ orgSlug } as never}
            className="text-button label-sm"
          >
            View all projects
            <ArrowRight size={13} />
          </Link>
        )}
      </div>
      {/* NOTE: the Project model only stores `project_name` (+ org + timestamps).
          There is no description/progress field on the backend, so each row
          shows the name + created date instead of invented progress bars. */}
      {projects.map((project) => (
        <div className="account-project" key={project._id}>
          <span className="account-project-icon" aria-hidden="true">
            <Folder size={18} />
          </span>
          <span>
            <strong className="label-sm">{project.project_name}</strong>
            <small className="para-xs org-muted">
              Created {formatDate(project.createdAt)}
            </small>
          </span>
          <ArrowRight size={14} />
        </div>
      ))}
      {projects.length === 0 && (
        <p className="account-empty para-sm org-muted">
          No projects yet. Create one from the Projects page.
        </p>
      )}
    </section>
  );
};

export default OrganizationProjects;
