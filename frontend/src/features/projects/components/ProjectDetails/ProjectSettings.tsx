import { Suspense, useState } from "react";
import { Button } from "../../../../components/ui/Button/Button";
import { PROJECT_SETTING } from "../../../../constants/project-settings.constants";
import type { ProjectSettingsProps } from "../../types";

const ProjectSettings = ({
  orgId,
  projectId,
  canManage,
}: ProjectSettingsProps) => {
  const [activeTab, setActiveTab] = useState<string>(PROJECT_SETTING[0].label);
  const ActiveComponent =
    PROJECT_SETTING.find((s) => s.label === activeTab)?.component ??
    PROJECT_SETTING[0].component;

  return (
    <div className="project-settings-layout">
      <nav
        className="project-settings-nav"
        aria-label="Project settings sections"
      >
        {PROJECT_SETTING.map((s) => (
          <Button
            key={s.label}
            type="button"
            className={`${s.label === activeTab ? "active" : ""} label-md`}
            onPress={() => setActiveTab(s.label)}
            variant="ghost"
            style={{ textAlign: "start" }}
          >
            {s.label}
          </Button>
        ))}
      </nav>
      <section className="panel padded settings-panel">
        <Suspense fallback={<p>Loading…</p>}>
          <ActiveComponent
            orgId={orgId}
            projectId={projectId}
            canManage={canManage}
          />
        </Suspense>
      </section>
    </div>
  );
};

export default ProjectSettings;
