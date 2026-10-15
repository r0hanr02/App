import { Suspense, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import "./style.scss";
import { Label } from "../../../../components/ui/Form/Form";
import { Button } from "../../../../components/ui/Button/Button";
import { Tab, TabList, Tabs } from "../../../../components/ui/Tabs/Tabs";
import {
  PROJECT_TABS,
  type ProjectTab,
} from "../../../../constants/project-tabs.constants";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { useGetProject } from "../../api/projects.api";
import CreateTaskModal from "./CreateTaskModal";

const getPanel = (label: ProjectTab) =>
  PROJECT_TABS.find((t) => t.label === label)?.component ??
  PROJECT_TABS[0].component;

const OverviewPanel = getPanel("Overview");
const BoardPanel = getPanel("Board");
const MembersPanel = getPanel("Members");
const SettingsPanel = getPanel("Settings");

const ProjectDetails = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { activeOrgId, activeOrg } = useActiveOrg();
  const [tab, setTab] = useState<ProjectTab>("Overview");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const role = activeOrg?.role ?? "";
  const canManage = role === "OWNER" || role === "ADMIN";

  const { data: projectRes, isLoading } = useGetProject(
    activeOrgId,
    projectId ?? null,
  );

  if (!activeOrgId || !projectId) {
    return (
      <div className="project-details-page">
        <div className="page-heading">
          <div>
            <Label className="title-lg">Project</Label>
            <p className="para-sm org-muted">
              Select a workspace and project to continue.
            </p>
          </div>
        </div>
        <section className="panel org-empty">
          <h2>Missing context</h2>
          <p className="para-sm org-muted">
            No organization or project selected.
          </p>
        </section>
      </div>
    );
  }

  if (isLoading) return <p>Loading…</p>;
  const project = projectRes?.data;
  if (!project) return <p>Project not found.</p>;

  return (
    <div className="project-details-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow subheading-xs">Project overview</p>
          <Label className="title-lg">{project.project_name}</Label>
          <p className="para-sm org-muted">
            {project.project_description?.trim() || "No description yet."}
          </p>
        </div>
        {canManage && (
          <div className="heading-actions">
            <Button
              variant="primary"
              leftIcon={<Plus size={15} />}
              onPress={() => setIsCreateOpen(true)}
            >
              Create Task
            </Button>
          </div>
        )}
      </div>

      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => setTab(key as ProjectTab)}
        className="page-tabs"
      >
        <TabList aria-label="Project sections">
          {PROJECT_TABS.map((item) => (
            <Tab key={item.label} id={item.label}>
              {item.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>

      <Suspense fallback={<p>Loading…</p>}>
        {tab === "Overview" && (
          <OverviewPanel
            orgId={activeOrgId}
            projectId={projectId}
            onOpenBoard={() => setTab("Board")}
          />
        )}

        {(tab === "Board" || tab === "List") && (
          <BoardPanel
            orgId={activeOrgId}
            projectId={projectId}
            canManage={canManage}
            view={tab}
            onViewChange={setTab}
          />
        )}

        {tab === "Members" && (
          <MembersPanel
            orgId={activeOrgId}
            projectId={projectId}
            canManage={canManage}
          />
        )}

        {tab === "Settings" && (
          <SettingsPanel
            orgId={activeOrgId}
            projectId={projectId}
            canManage={canManage}
          />
        )}
      </Suspense>

      {canManage && (
        <CreateTaskModal
          orgId={activeOrgId}
          projectId={projectId}
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
