import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Clock3,
  ListTodo,
  Plus,
} from "lucide-react";
import { useActiveOrg } from "../../../../hooks/useActiveOrg";
import { useStore } from "../../../../store/store";
import { Button } from "../../../../components/ui/Button/Button";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { ROUTES } from "../../../../constants/routes.constants";
import { useHomeDashboard, type DashboardTask } from "../../api/home.api";
import {
  eyebrowFor,
  greetingFor,
  isOverdue,
  startOfToday,
} from "../../utils/home.utils";
import { STATUS_META } from "../../components/StatusPill/StatusPill";
import { StatCard } from "../../components/StatCard/StatCard";
import { ProjectCard } from "../../components/ProjectCard/ProjectCard";
import { ActivityChart } from "../../components/ActivityChart/ActivityChart";
import { AssignedTasksPanel } from "../../components/AssignedTasksPanel/AssignedTasksPanel";
import { DeadlinesPanel } from "../../components/DeadlinesPanel/DeadlinesPanel";
import { ActivityPanel } from "../../components/ActivityPanel/ActivityPanel";
import { WorkloadPanel } from "../../components/WorkloadPanel/WorkloadPanel";
import { CreateTaskModal } from "../../components/CreateTaskModal/CreateTaskModal";
import "./style.scss";

const Home = () => {
  const navigate = useNavigate();
  const user = useStore((s) => s.data?.user);
  const { organizations, activeOrg, activeOrgId, navigateWithOrg, isLoading } =
    useActiveOrg();
  const dashboard = useHomeDashboard(activeOrgId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => startOfToday(), []);

  const tasks = useMemo(() => dashboard.data?.tasks ?? [], [dashboard.data]);
  const projects = useMemo(
    () => dashboard.data?.projects ?? [],
    [dashboard.data],
  );
  const members = useMemo(
    () => dashboard.data?.members ?? [],
    [dashboard.data],
  );

  const currentUserId = user?.id ?? null;
  const firstName = user?.name?.split(" ")[0] || "there";
  const orgName = activeOrg?.organization_id?.organization_name;

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW",
  ).length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const overdueCount = tasks.filter((t) => isOverdue(t, today)).length;
  const createdThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return tasks.filter((t) => new Date(t.createdAt).getTime() >= weekAgo)
      .length;
  }, [tasks]);
  const completedThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return tasks.filter(
      (t) => t.status === "DONE" && new Date(t.updatedAt).getTime() >= weekAgo,
    ).length;
  }, [tasks]);

  const go = (to: string) => navigateWithOrg(to);

  const showTask = (task: DashboardTask) => {
    toast.info(
      task.task_name,
      `${STATUS_META[task.status]?.label ?? task.status} · ${task.projectName ?? "Task"}`,
    );
  };

  if (!isLoading && organizations.length === 0) {
    return (
      <div className="home-empty">
        <span className="home-empty-icon">
          <ListTodo size={28} strokeWidth={1.5} />
        </span>
        <p className="eyebrow">{eyebrowFor(now)}</p>
        <h1>
          {greetingFor(now.getHours())}, {firstName}
        </h1>
        <p>Create a workspace to start tracking projects and tasks.</p>
        <div className="home-empty-actions">
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onPress={() => navigate({ to: ROUTES.ONBOARDING.path })}
          >
            Create workspace
          </Button>
          <Button
            variant="secondary"
            rightIcon={<ArrowRight size={14} />}
            onPress={() => navigate({ to: ROUTES.NOORGANIZATION.path })}
          >
            Learn more
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !activeOrgId || dashboard.isLoading) {
    return (
      <div
        className="home-loading"
        aria-busy="true"
        aria-label="Loading dashboard"
      >
        <div className="skeleton skeleton-heading" />
        <div className="skeleton-grid">
          {[0, 1, 2, 3].map((i) => (
            <div className="skeleton skeleton-card" key={i} />
          ))}
        </div>
        <div className="skeleton skeleton-panel" />
      </div>
    );
  }

  if (dashboard.isError) {
    return (
      <div className="home-empty">
        <h1>Couldn&apos;t load your workspace</h1>
        <p>Check your connection and try again.</p>
        <Button variant="primary" onPress={() => dashboard.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{eyebrowFor(now)}</div>
          <h1>
            {greetingFor(now.getHours())}, {firstName}{" "}
            <span className="wave">☀</span>
          </h1>
          <p>
            {orgName
              ? `Here’s what’s happening in ${orgName} today.`
              : "Here’s what’s happening with your workspace today."}
          </p>
        </div>
        <div className="heading-actions">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<CalendarDays size={15} />}
            rightIcon={<ChevronDown size={13} />}
            onPress={() => toast.info("Showing the last 7 days")}
          >
            This week
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onPress={() => setIsCreateOpen(true)}
          >
            Create task
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total tasks"
          value={String(totalTasks)}
          detail={`+${createdThisWeek} this week`}
          icon={ListTodo}
          tone="indigo"
          onPress={() => go(ROUTES.TASKS.path)}
        />
        <StatCard
          title="In progress"
          value={String(inProgressTasks)}
          detail={`Across ${projects.length} active project${projects.length === 1 ? "" : "s"}`}
          icon={Clock3}
          tone="amber"
          onPress={() => go(ROUTES.TASKS.path)}
        />
        <StatCard
          title="Completed"
          value={String(doneTasks)}
          detail={`+${completedThisWeek} this week`}
          icon={CircleCheck}
          tone="green"
          onPress={() => go(ROUTES.TASKS.path)}
        />
        <StatCard
          title="Overdue"
          value={String(overdueCount)}
          detail={
            overdueCount === 0
              ? "All caught up"
              : `${overdueCount} need${overdueCount === 1 ? "s" : ""} your attention`
          }
          detailDanger={overdueCount > 0}
          icon={CalendarDays}
          tone="red"
          onPress={() => go(ROUTES.TASKS.path)}
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <AssignedTasksPanel
            tasks={tasks}
            currentUserId={currentUserId}
            projects={projects}
            onTaskPress={showTask}
            onViewAll={() => go(ROUTES.TASKS.path)}
          />

          <section className="projects-section">
            <div className="section-heading">
              <h2>
                Active projects{" "}
                <span className="count-pill">{projects.length}</span>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-button"
                rightIcon={<ArrowRight size={14} />}
                onPress={() => go(ROUTES.PROJECTS.path)}
              >
                View all projects
              </Button>
            </div>
            {projects.length === 0 ? (
              <p className="empty-note">
                No projects in this workspace yet.
              </p>
            ) : (
              <div className="project-grid dashboard-projects">
                {projects.slice(0, 3).map((project) => {
                  const projectTasks = tasks.filter(
                    (t) =>
                      (typeof t.project_id === "string"
                        ? t.project_id
                        : t.project_id?._id) === project._id,
                  );
                  return (
                    <ProjectCard
                      key={project._id}
                      name={project.project_name}
                      taskCount={projectTasks.length}
                      doneCount={
                        projectTasks.filter((t) => t.status === "DONE").length
                      }
                      onPress={() => go(ROUTES.PROJECTS.path)}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <ActivityChart tasks={tasks} />
        </div>

        <div className="dashboard-secondary">
          <DeadlinesPanel
            tasks={tasks}
            today={today}
            onTaskPress={showTask}
            onViewAll={() => go(ROUTES.TASKS.path)}
          />
          <ActivityPanel
            tasks={tasks}
            onTaskPress={showTask}
            onViewAll={() => go(ROUTES.NOTIFICATION.path)}
            onRefresh={() => dashboard.refetch()}
          />
          <WorkloadPanel
            tasks={tasks}
            members={members}
            onViewTeam={() => go(ROUTES.USERS.path)}
          />
        </div>
      </div>

      <div className="dashboard-footer">
        <span>
          <span className="live-dot" />
          All systems operational
        </span>
        <span>
          Made for teams that build.{" "}
          <span className="footer-orbit">orbit.</span>
        </span>
        <span>
          Last updated just now <Activity size={12} />
        </span>
      </div>

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        orgId={activeOrgId}
        projects={projects}
      />
    </>
  );
};

export default Home;
