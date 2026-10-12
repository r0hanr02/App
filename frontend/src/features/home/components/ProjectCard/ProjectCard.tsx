import { Button } from "../../../../components/ui/Button/Button";

interface ProjectCardProps {
  name: string;
  taskCount: number;
  doneCount: number;
  onPress: () => void;
}

export function ProjectCard({
  name,
  taskCount,
  doneCount,
  onPress,
}: ProjectCardProps) {
  const percent =
    taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100);

  return (
    <Button
      variant="ghost"
      className="project-card"
      onPress={onPress}
      aria-label={`${name}: ${doneCount} of ${taskCount} tasks done`}
    >
      <span className="project-logo" aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="project-meta">
        <strong>{name}</strong>
        <small>
          {taskCount} task{taskCount === 1 ? "" : "s"} · {doneCount} done
        </small>
      </span>
      <span className="project-progress">
        <i style={{ width: `${percent}%` }} />
      </span>
      <span className="project-percent">{percent}%</span>
    </Button>
  );
}

export default ProjectCard;
