import { useEffect, useState } from "react";

const STORAGE_KEY = "orbit-notification-prefs";

interface Prefs {
  taskAssigned: boolean;
  mentions: boolean;
  weeklyDigest: boolean;
}

const DEFAULTS: Prefs = { taskAssigned: true, mentions: true, weeklyDigest: false };

const load = (): Prefs => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
};

const Notification = () => {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    setPrefs(load());
  }, []);

  const toggle = (key: keyof Prefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return (
    <>
      <h2>Notifications</h2>
      <p>Stored locally on this device for now — server-side preferences are coming later.</p>
      <label className="toggle-row">
        <span>
          Task assigned to me
          <small>Notify when someone assigns you a task.</small>
        </span>
        <input
          type="checkbox"
          checked={prefs.taskAssigned}
          onChange={() => toggle("taskAssigned")}
        />
      </label>
      <label className="toggle-row">
        <span>
          Mentions
          <small>Notify when someone mentions you in a comment.</small>
        </span>
        <input
          type="checkbox"
          checked={prefs.mentions}
          onChange={() => toggle("mentions")}
        />
      </label>
      <label className="toggle-row">
        <span>
          Weekly digest
          <small>A summary of workspace activity every Monday.</small>
        </span>
        <input
          type="checkbox"
          checked={prefs.weeklyDigest}
          onChange={() => toggle("weeklyDigest")}
        />
      </label>
    </>
  );
};

export default Notification;
