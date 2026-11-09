import { Suspense, useState } from "react";
import { useParams } from "@tanstack/react-router";
import "./style.scss";
import PageHeading from "../../../../components/ui/PageHeading/PageHeading";
import { Tab, TabList, Tabs } from "../../../../components/ui/Tabs/Tabs";
import {
  PROJECT_TABS,
  type ProjectTab,
} from "../../../../constants/project-tabs.constants";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { useGetProject } from "../../api/projects.api";
import CreateTaskModal from "./CreateTaskModal";
import { Loader2 } from "lucide-react";
import axios from "axios";

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

  // Members / Settings have `show: false` in PROJECT_TABS —
  // only ADMIN / OWNER (canManage) should see them.
  const visibleTabs = PROJECT_TABS.filter((t) => t.show || canManage);

  // Guard against staying on a restricted tab after role change
  // (e.g. deep-link or role downgrade to MEMBER).
  // useEffect(() => {
  //   if (!canManage && (tab === "Members" || tab === "Settings")) {
  //     setTab("Overview");
  //   }
  // }, [canManage, tab]);

  const {
    data: projectRes,
    isLoading,
    error,
  } = useGetProject(activeOrgId, projectId ?? null);

  if (!activeOrgId || !projectId) {
    return (
      <div className="project-details-page">
        <PageHeading
          title="Project"
          subtitle="Select a workspace and project to continue."
        />
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
  if (!project)
    return (
      <p>
        {axios.isAxiosError(error)
          ? error.response?.data?.message
          : error?.message}
      </p>
    );

  return (
    <div className="project-details-page">
      <PageHeading
        topPara="Project overview"
        title={project.project_name}
        subtitle={project.project_description?.trim() || "No description yet."}
        action={canManage ? "Create Task" : undefined}
        onAction={canManage ? () => setIsCreateOpen(true) : undefined}
      />

      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => setTab(key as ProjectTab)}
        className="page-tabs"
      >
        <TabList aria-label="Project sections">
          {visibleTabs.map((item) => (
            <Tab key={item.label} id={item.label}>
              {item.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>

      <Suspense
        fallback={
          <div className="loading">
            <Loader2 className="lucide lucide-loader-2" />
          </div>
        }
      >
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

        {canManage && tab === "Members" && (
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
