import { useState } from "react";
import "./style.scss";
import { Button } from "../../../../components/ui/Button/Button";
import { Plus, Projector } from "lucide-react";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import ProjectModal from "../../components/ProjectModal/ProjectModal";
const Projects = () => {
  const {
    activeOrgId,
    activeOrg,
    activeOrgSlug,
    isLoading: isOrgsLoading,
  } = useActiveOrg();

  const canCreate = activeOrg.role === "OWNER" || activeOrg.role === "ADMIN";
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);

  return (
    <div className="project-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow subheading-xs">Workspace overview</p>
          <h1 className="title-lg">Projects</h1>
          <p className="para-sm org-muted">
            The people, projects, and purpose behind your workspace.
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

      {isProjectsModalOpen ? (
        <ProjectModal
          isOpen={isProjectsModalOpen}
          onClose={() => setIsProjectsModalOpen(false)}
        />
      ) : null}
    </div>
  );
};

export default Projects;
