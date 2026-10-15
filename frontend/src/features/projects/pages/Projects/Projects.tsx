import { useState } from "react";
import "./style.scss";
import { Button } from "../../../../components/ui/Button/Button";
import { Plus } from "lucide-react";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import ProjectModal from "../../components/ProjectModal/ProjectModal";
import { Label } from "../../../../components/ui/Form/Form";
import { useGetAllProjects } from "../../api/projects.api";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
const Projects = () => {
  const { activeOrgId, activeOrg, isLoading: isOrgsLoading } = useActiveOrg();

  const canCreate = activeOrg?.role === "OWNER" || activeOrg?.role === "ADMIN";
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const { data: ProjectsData, isPending } = useGetAllProjects(activeOrgId);

  const projects = ProjectsData?.data ?? [];
  const isLoading = isOrgsLoading || isPending;

  return (
    <div className="project-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow subheading-xs">
            Organization Projects overview
          </p>
          <Label className="title-lg">Projects</Label>
          <p className="para-sm org-muted">
            Big ideas, organized. Keep every project moving forward.
          </p>
        </div>
        {canCreate && (
          <div className="heading-actions">
            <Button
              variant="primary"
              leftIcon={<Plus size={15} />}
              onPress={() => setIsProjectsModalOpen(true)}
            >
              Create Project
            </Button>
          </div>
        )}
      </div>

      <div className="page-search"></div>

      <div className="project-grid">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="project-card project-card--skeleton">
                <span className="skeleton skeleton-icon" />
                <span className="skeleton skeleton-line" />
                <span className="skeleton skeleton-line short" />
              </div>
            ))
          : projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
      </div>

      {!isLoading && projects.length === 0 && (
        <div className="panel org-empty">
          <h2>No projects yet</h2>
          <p className="para-sm org-muted">
            Create your first project to start organizing work.
          </p>
        </div>
      )}

      {isProjectsModalOpen ? (
        <ProjectModal
          isOpen={isProjectsModalOpen}
          onClose={() => setIsProjectsModalOpen(false)}
          orgId={activeOrgId}
        />
      ) : null}
    </div>
  );
};

export default Projects;
