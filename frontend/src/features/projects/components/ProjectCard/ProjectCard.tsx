import "./style.scss";
import { useNavigate, useParams } from "@tanstack/react-router";
import type { ProjectData } from "../../api/projects.api";
import {
  Folder,
  Rocket,
  Lightbulb,
  Layers,
  Code,
  Globe,
  Package,
  Target,
  type LucideIcon,
  CalendarDays,
} from "lucide-react";
import ThreeDotMenu from "../../../../components/ui/ThreeDotMenu/ThreeDotMenu";

const ICONS: LucideIcon[] = [
  Folder,
  Rocket,
  Lightbulb,
  Layers,
  Code,
  Globe,
  Package,
  Target,
];

const TINTS = [
  "tint-indigo",
  "tint-green",
  "tint-blue",
  "tint-purple",
  "tint-orange",
  "tint-pink",
  "tint-yellow",
] as const;

const hash = (str: string) =>
  [...str].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0);

const pick = <T,>(arr: readonly T[], key: string): T =>
  arr[hash(key) % arr.length] as T;

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
};

export type ProjectCardProps = {
  project: ProjectData;
  onOpen?: (project: ProjectData) => void;
};

const ProjectCard = ({ project, onOpen }: ProjectCardProps) => {
  const navigate = useNavigate();
  const { orgSlug } = useParams({ strict: false }) as { orgSlug?: string };

  const Icon = pick(ICONS, project?._id || project.project_name);
  const tint = pick(TINTS, project?._id || project.project_name);

  const handleOpen = () => {
    if (onOpen) {
      onOpen(project);
      return;
    }
    if (orgSlug) {
      navigate({
        to: "/$orgSlug/projects" as never,
        params: { orgSlug } as never,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      className="project-card"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open project ${project.project_name}`}
    >
      <div className="project-top flex aic jcsb">
        <div className="flex g8">
          <span className={`project-icon ${tint}`} aria-hidden="true">
            <Icon size={18} />
          </span>
          <span className="badge green">On track</span>
        </div>

        <div
          className="project-menu"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <ThreeDotMenu
            ariaLabel={`More actions for ${project.project_name}`}
            trigger={<span className="project-menu-dots">···</span>}
            items={[
              {
                key: "open",
                label: "Open project",
                onClick: handleOpen,
              },
              {
                key: "copy-id",
                label: "Copy project ID",
                onClick: () => navigator.clipboard?.writeText(project._id),
              },
            ]}
          />
        </div>
      </div>

      <h3 className="project-name" title={project.project_name}>
        {project.project_name}
      </h3>
      <p className="project-desc">
        {project.project_description?.trim() || "No description yet."}
      </p>

      <div className="project-footer">
        <span className="project-avatar" aria-hidden="true">
          {getInitials(project.project_name)}
        </span>
        <span className="project-date">
          <CalendarDays size={12} />
          {formatDate(project.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
