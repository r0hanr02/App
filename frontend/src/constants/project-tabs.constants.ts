import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type ProjectTabPanel = LazyExoticComponent<ComponentType<any>>;

export const PROJECT_TAB_LABELS = [
  "Overview",
  "Board",
  "List",
  "Members",
  "Settings",
] as const;

export type ProjectTab = (typeof PROJECT_TAB_LABELS)[number];

export type ProjectTabItem = {
  label: ProjectTab;
  component: ProjectTabPanel;
  show:boolean
};

const ProjectBoardPanel = lazy(
  () => import("../features/projects/components/ProjectDetails/ProjectBoard"),
) as ProjectTabPanel;

export const PROJECT_TABS: readonly ProjectTabItem[] = [
  {
    label: "Overview",
    component: lazy(
      () =>
        import("../features/projects/components/ProjectDetails/ProjectOverview"),
    ) as ProjectTabPanel,
    show:true

  },
  { label: "Board", component: ProjectBoardPanel,show:true },
  { label: "List", component: ProjectBoardPanel,show:true },
  {
    label: "Members",
    component: lazy(
      () =>
        import("../features/projects/components/ProjectDetails/ProjectMembers"),
    ) as ProjectTabPanel,
    show:false
  },
  {
    label: "Settings",
    component: lazy(
      () =>
        import("../features/projects/components/ProjectDetails/ProjectSettings"),
    ) as ProjectTabPanel,
    show:true
  },
];
