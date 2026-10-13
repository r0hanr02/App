import { Monitor, Moon, Sun } from "lucide-react";
import { useStore } from "../../../store/store";
import { Button } from "../../../components/ui/Button/Button";

const Appearance = () => {
  const theme = useStore((s) => s.theme);
  const isSystem = useStore((s) => s.isSystem);
  const setTheme = useStore((s) => s.setTheme);
  const setSystemTheme = useStore((s) => s.setSystemTheme);

  const selected = isSystem ? "system" : theme;

  return (
    <>
      <h2>Appearance</h2>
      <p>Choose how Orbit looks. System follows your OS preference.</p>
      <div className="theme-options">
        <Button
          type="button"
          className={`button ${selected === "light" ? "selected" : ""}`}
          onClick={() => setTheme("light")}
          variant="outline"
        >
          <Sun size={20} />
          <strong>Light</strong>
        </Button>
        <Button
          type="button"
          className={`button ${selected === "dark" ? "selected" : ""}`}
          onClick={() => setTheme("dark")}
          variant="outline"
        >
          <Moon size={20} />
          <strong>Dark</strong>
        </Button>
        <Button
          type="button"
          className={`button ${selected === "system" ? "selected" : ""}`}
          onClick={() => setSystemTheme()}
          variant="outline"
        >
          <Monitor size={20} />
          <strong>System</strong>
        </Button>
      </div>
    </>
  );
};

export default Appearance;
