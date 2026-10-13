import { Suspense, useState } from "react";
import "./style.scss";
import "../../components/style.scss";
import { SETTING } from "../../../../constants/settings.constants";
import { Button } from "../../../../components/ui/Button/Button";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<string>(SETTING[0].label);
  const ActiveComponent =
    SETTING.find((s) => s.label === activeTab)?.component ??
    SETTING[0].component;

  return (
    <div className="setting-page">
      <div className="page-heading">
        <div>
          <h1 className="title-lg">Settings</h1>
          <p className="para-sm profile-muted">
            Make this workspace work for you.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {SETTING.map((s) => (
            <Button
              key={s.label}
              type="button"
              className={`${s.label === activeTab ? "active" : ""} label-md`}
              onClick={() => setActiveTab(s.label)}
              variant="ghost"
              style={{ textAlign: "start" }}
            >
              {s.label}
            </Button>
          ))}
        </nav>
        <div className="settings-panel">
          <Suspense fallback={<p>Loading…</p>}>
            <ActiveComponent />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Settings;
