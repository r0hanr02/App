import { useMemo, useState } from "react";
import "./style.scss";
import { Button } from "../../../../components/ui/Button/Button";
import { ArrowDownAZ, ArrowUpAZ, Plus, Search } from "lucide-react";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import ProjectModal from "../../components/ProjectModal/ProjectModal";
import { Label } from "../../../../components/ui/Form/Form";
import { useGetAllProjects } from "../../api/projects.api";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import { TextField } from "../../../../components/ui/TextField/TextField";
const Projects = () => {
  const { activeOrgId, activeOrg, isLoading: isOrgsLoading } = useActiveOrg();

  const canCreate = activeOrg?.role === "OWNER" || activeOrg?.role === "ADMIN";
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAscending, setSortAscending] = useState(true);
  const { data: ProjectsData, isPending } = useGetAllProjects(activeOrgId);

  const projects = ProjectsData?.data ?? [];
  const isLoading = isOrgsLoading || isPending;

  const visibleProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? projects.filter(
          (project) =>
            project.project_name.toLowerCase().includes(query) ||
            project.project_description?.toLowerCase().includes(query),
        )
      : [...projects];
    filtered.sort((a, b) => {
      const comparison = a.project_name.localeCompare(b.project_name);
      return sortAscending ? comparison : -comparison;
    });
    return filtered;
  }, [projects, searchQuery, sortAscending]);

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

      <div className="page-search">
        <TextField
          placeholder="Search Projects"
          aria-label="Search projects"
          value={searchQuery}
          onChange={setSearchQuery}
          leftIcon={<Search size={16} />}
        />
        <Button
          leftIcon={
            sortAscending ? <ArrowDownAZ size={15} /> : <ArrowUpAZ size={15} />
          }
          variant="secondary"
          aria-label={sortAscending ? "Sort Z to A" : "Sort A to Z"}
          onPress={() => setSortAscending((prev) => !prev)}
        >
          {sortAscending ? "Name A-Z" : "Name Z-A"}
        </Button>
      </div>

      <div className="project-grid">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="project-card project-card--skeleton">
                <span className="skeleton skeleton-icon" />
                <span className="skeleton skeleton-line" />
                <span className="skeleton skeleton-line short" />
              </div>
            ))
          : visibleProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
      </div>

      {!isLoading && visibleProjects.length === 0 && (
        <div className="panel org-empty">
          <h2>{searchQuery ? "No matching projects" : "No projects yet"}</h2>
          <p className="para-sm org-muted">
            {searchQuery
              ? `Nothing found for "${searchQuery}". Try a different search.`
              : "Create your first project to start organizing work."}
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
