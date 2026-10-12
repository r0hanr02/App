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
import { useStore } from "../../../../store/store";
import { Button } from "../../../../components/ui/Button/Button";
import { toast } from "../../../../components/ui/Toast/toast.api";
import { ROUTES } from "../../../../constants/routes.constants";
import {
  DUMMY_ACTIVE_ORG,
  DUMMY_MEMBERS,
  DUMMY_ORGANIZATIONS,
  DUMMY_PROJECTS,
  DUMMY_TASKS,
  DUMMY_USER,
  type DashboardTask,
  type DashboardTaskPriority,
} from "../../data/home.dummy";
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

// Dummy-only Home — no API calls. Wire real hooks back in later.
const Home = () => {
  const navigate = useNavigate();
  const storeUser = useStore((s) => s.data?.user);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Dummy workspace state (local only).
  const [tasks, setTasks] = useState<DashboardTask[]>(DUMMY_TASKS);
  const projects = DUMMY_PROJECTS;
  const members = DUMMY_MEMBERS;
  const organizations = DUMMY_ORGANIZATIONS;
  const activeOrg = DUMMY_ACTIVE_ORG;

  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => startOfToday(), []);

  const currentUserId = storeUser?.id ?? DUMMY_USER.id;
  const firstName =
    storeUser?.name?.split(" ")[0] || DUMMY_USER.name.split(" ")[0];
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

  const go = (to: string) => {
    navigate({ to }).catch((err) => {
      console.warn(`Navigation to ${to} failed:`, err);
    });
  };

  const showTask = (task: DashboardTask) => {
    toast.info(
      task.task_name,
      `${STATUS_META[task.status]?.label ?? task.status} · ${task.projectName ?? "Task"}`,
    );
  };

  const handleCreateTask = (input: {
    task_name: string;
    priority: DashboardTaskPriority;
    due_date?: string;
    projectId: string;
  }) => {
    const project = projects.find((p) => p._id === input.projectId);
    const nowIso = new Date().toISOString();
    const newTask: DashboardTask = {
      _id: `task-dummy-${Date.now()}`,
      task_name: input.task_name,
      status: "TODO",
      priority: input.priority,
      due_date: input.due_date || null,
      project_id: input.projectId,
      projectName: project?.project_name,
      organization_id: activeOrg.organization_id._id,
      creator_id: { _id: currentUserId, name: DUMMY_USER.name },
      assignee_id: { _id: currentUserId, name: DUMMY_USER.name },
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setTasks((prev) => [newTask, ...prev]);
    toast.success("Task created successfully");
    setIsCreateOpen(false);
  };

  if (organizations.length === 0) {
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
              <p className="empty-note">No projects in this workspace yet.</p>
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
            onRefresh={() => toast.info("Already up to date")}
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
          All systems operational{" "}
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
        projects={projects}
        onCreate={handleCreateTask}
      />
    </>
  );
};

export default Home;
