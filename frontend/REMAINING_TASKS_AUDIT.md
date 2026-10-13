================================================================================
 FRONTEND — AUDIT REPORT (NEW — no prior report existed)
 Frontend: C:\Users\uk\OneDrive\Desktop\Apps\APP\frontend\
 Spec:    backend\multi-tenant-project-platform-features.md
          (Frontend section :355-384 + React State :376-384 + Phases)
          Cross-checked against live backend routes (backend/REMAINING_TASKS_AUDIT.md
          2026-10-13: 32 API routes callable).
 Date:    2026-10-13
 Auditor: Muse Spark (model: muse-spark-1.3-contributor-free)
 Method:  Live read of src/router.ts, factories/*, constants/*, features/*,
          components/*, store/*, hooks/*, configs/*. File count: ~100 under src/.
 Stack:   React 19 + Vite + TanStack Router/Query + Zustand + Axios + SCSS
          (frontend/package.json — matches spec: TanStack Query server state,
          Zustand client state).
================================================================================

SUMMARY (counts)
--------------------------------------------------------------------------------
ROUTES DEFINED:        12 (constants/routes.constants.ts:1-62)
ROUTES WITH REAL UI:    6 (HOME, LOGIN, REGISTER, NOORGANIZATION, ONBOARDING, PROFILE)
ROUTES STILL NotFound:  6 (PROJECTS, TASKS, USERS, ORGANIZATION, NOTIFICATION, SETTINGS
                        -> ComponentFactory.tsx:19-24 all lazy-load NotFound)
API HOOKS WIRED TO UI: ~4 of ~10 (auth me/login/register/profile + org list/create;
                        dashboard/project/task/member hooks exist but Home/Onboarding
                        run DUMMY-only with TODO comments to wire later)
SPEC FRONTEND ITEMS:   ~19 listed (auth screens, org selector, 2 dashboards, sidebar,
                        task board, task details, member/role mgmt, notifications,
                        activity, search, filters, pagination, loading/error/empty,
                        optimistic, responsive, theme, dnd-later)
  DONE (real + backend-backed):  5  (auth screens, org selector/switch, layouts,
                                     basic dashboard SHELL, loading shells)
  DONE (UI-only, dummy data):    4  (dashboard widgets, onboarding form shell,
                                     no-org cards, profile display)
  MISSING / DUMMY:              10  (project pages, task board+details, member/role
                                     mgmt, notifications, activity feed, search/
                                     filters/pagination wiring, optimistic updates,
                                     theme wiring, dnd)
OVERALL FRONTEND: ~35-40% real integration (~70% visual shell, ~35% data wiring).
Backend is ahead of frontend: every MVP API the UI needs already exists, but the
UI only consumes auth + org-list. Biggest gap is WIRING, not backend availability.

================================================================================
DETAILED AUDIT — BY SPEC FRONTEND ITEM
================================================================================

[A] Authentication screens — features/auth/*
--------------------------------------------------------------------------------
Status: IMPLEMENTED (real API)
  Login.tsx + login.api.ts, Register.tsx + register.api.ts, auth.api.ts (authMe),
  profile.api.ts, Profile.tsx, auth.store.ts, api.interceptor.ts (Bearer attach),
  App.tsx boots once via authMe() with isAuthLoading gate. Route guards in
  RouteFactory.tsx:43-64 (requiresAuth -> redirect /login).
Remaining:
  - Change-password UI: no backend route yet (P0-2) — correctly absent.
  - Token-refresh UX: interceptor behavior vs cookie path "/api/v1/auth" — verify
    refresh fires on 401 and does not loop on /login.
  - Rate the authMe-on-GET quirk: frontend authMe() calls GET /auth/me which
    ROTATES refresh cookie server-side — works but every reload rotates tokens.
    Revisit when backend adds Bearer GET /me (then switch to Authorization header).

[B] Organization selector / switching — Navbar + Sidebar + org.store
--------------------------------------------------------------------------------
Status: IMPLEMENTED (real API)
  userOrganizationQueryOptions (home.api.ts:38) + useGetUserOrganization +
  useCreateOrganization + useActiveOrg + org.store.ts. Navbar/Sidebar show org
  switcher; RouteFactory beforeLoad ensures org data and redirects empty -> 
  /no-organization. Recent commits (325cc76, f45bb1e, 0f94a3b) cover this.
Remaining:
  - CREATE flow split-brain: useCreateOrganization hook EXISTS (home.api.ts:53)
    but Onboarding.tsx is dummy-only (see [D]) and NoOrgCard "Create" navigates
    to NOORGANIZATION (itself — likely should go ONBOARDING). Decide one canonical
    create path and wire the mutation + invalidation + active-org set.
  - Member/role management UI: no pages call POST/PATCH/DELETE /member or
    transfer-ownership yet (backend ready). Needed for OWNER/ADMIN workflows.
  - Leave-org UI: no button calls DELETE .../member/me (backend ready).

[C] Organization dashboard (Home) — features/home/pages/home/Home.tsx (331 lines)
--------------------------------------------------------------------------------
Status: UI COMPLETE, DATA DUMMY — HIGHEST-VALUE WIRING TASK
  9 widgets exist and look finished: StatCard x4, AssignedTasksPanel,
  DeadlinesPanel, ActivityPanel, ActivityChart, WorkloadPanel, ProjectCard x3,
  CreateTaskModal, StatusPill. Greeting/eyebrow/overdue/week-math utils done.
  BUT Home.tsx:44 is explicitly "Dummy-only Home — no API calls":
    tasks = useState(DUMMY_TASKS), projects/members/orgs from home.dummy.ts,
    handleCreateTask fabricates task-dummy-{Date.now()} locally + toast.
  Meanwhile home.api.ts:169-257 ALREADY implements useHomeDashboard(orgId)
  (parallel GET projects?limit=100 + GET member, then per-project fan-out
  GET tasks?limit=100 with per-project try/catch, client joins projectName) and
  useCreateTask(orgId, projectId) with dashboard invalidation — just never called.
Remaining (in order):
  1. Replace dummy useState with const { data, isLoading, isError } =
     useHomeDashboard(activeOrgId); keep dummy as fallback/empty-state only.
  2. Wire CreateTaskModal onCreate -> useCreateTask mutate (needs projectId
     picker — modal already takes projects prop; backend POST is ready).
  3. Loading/error/empty states: isAuthLoading pattern exists in App.tsx; replicate
     per-panel skeletons (spec requires them) + invalid-orgId + 403-member views.
  4. Pagination reality check: hooks request ?limit=100; backend caps limit<=100
     and defaults page=1/limit=10 — fine for MVP but add "view all" -> TASKS page
     before orgs exceed 100 projects/tasks. Dashboard aggregate API (backend P1-2)
     later replaces fan-out (N+1: 1 + 1 + P requests).
  5. go() navigations point at TASKS/PROJECTS/USERS/NOTIFICATION — all NotFound
     today (see [E]); either hide buttons or land the pages first.

[D] Onboarding (create organization) — features/home/pages/onboarding/Onboarding.tsx
--------------------------------------------------------------------------------
Status: FORM SHELL DONE, SUBMIT DUMMY
  Comment :11 "Dummy-only onboarding — no API calls." Local formData
  (name/slug/description/logo File + preview URL), validation toast, isPending
  stub — but useCreateOrganization (FormData POST /organization, multipart for
  organization_logo) is never called; submit does not navigate/set active org.
Remaining: wire mutation (FormData incl. file), onSuccess invalidate
  ["user_organization"] + set active + navigate HOME; onError toast 409-dup vs 400.
  Also fix NoOrganization "Create Organization" button (currently self-navigates
  to NOORGANIZATION — should go ONBOARDING).

[E] Missing pages (all render NotFound inside layout) — ComponentFactory.tsx:19-24
--------------------------------------------------------------------------------
Status: NOT STARTED (6/12 routes) — in spec order of value:
  1. PROJECTS (/projects): list (reuse Table + SearchField + ProjectCard), details
     (挪用 getProject/getAllMemberInProject hooks to build), create (POST projects),
     edit (PATCH), delete (OWNER, cascade confirm), members add/remove.
     Backend: all 8 project routes DONE — zero backend blockers.
  2. TASKS (/tasks): board/table by status (reuse AssignedTasksPanel/StatusPill/
     Tabs/DropDown), details (GET :taskId), create/edit (POST/PATCH :taskId),
     assign/unassign (PATCH :taskId/assign), delete (soft). Filters map 1:1 to
     backend ?status=&priority=&type=&assignee_id=&search=&page=&limit=.
     Backend: all 6 task routes DONE.
  3. USERS (/users): org member list (GET /member), add (POST), role change
     (PATCH :userId), remove (DELETE), leave (DELETE /member/me), transfer
     (POST transfer-ownership). Reuse Table + Modal confirm + last-OWNER error surfacing.
  4. ORGANIZATION (/organization): settings (PATCH org incl. logo upload), danger
     zone delete (DELETE cascade confirm), ownership transfer form.
  5. NOTIFICATION (/notification): inbox + read/read-all — BACKEND MISSING (V2).
     Build only as designed-empty state until API lands; do not fake.
  6. SETTINGS (/settings): theme (theme.store.ts exists — wire toggle), profile
     edit (PATCH /auth/me exists — Profile.tsx display-only today, add form),
     URL-state for filters (spec) — none wired yet.

[F] Task board / details / member+role mgmt / activity / search / filters / pagination
--------------------------------------------------------------------------------
Status: NOT STARTED as wired features (widgets exist, data flow does not).
  SearchField, Tabs, DropDown, Table (with table.types.ts), pagination types in
  home.api.ts (ProjectsResponse/TasksResponse carry pagination) — all built but
  no page consumes ?search=&status=&page=&limit= except the unused useHomeDashboard.
  Optimistic updates: none (only dashboard invalidation in useCreateTask).
  URL-state filters: none (useState/local only). Infinite queries: none.
Remaining: land with [E1]/[E2]; keep queryKeys ["home_dashboard", orgId],
  ["user_organization"], ["create_task", ...] stable so later optimistic patches apply.

[G] React State / Data fetching — lib/queryClient.ts, hooks/useApi.ts, store/*
--------------------------------------------------------------------------------
Status: IMPLEMENTED (conventions good)
  queryOptions for orgs (stale 30s), useApiQuery/useApiMutation wrappers,
  apifetch central (configs/api.ts + interceptor), Zustand stores split by domain
  (auth/org/theme/toast), useActiveOrg + orgParams helpers.
Remaining:
  - Silent-flag fan-out (silent:true) swallows per-project errors — surface a
    partial-failure banner once Home is wired (spec: error states).
  - console.log(organization) in RouteFactory.tsx:58 — remove (prod noise).
  - Standardize response unwrap: backend returns { message, data } but auth
    returns { success, ... } — hooks assume res.data.data in places; align when
    backend does P0-4.

[H] UI kit / layouts / styles
--------------------------------------------------------------------------------
Status: IMPLEMENTED (broad)
  RootLayout + Navbar + Sidebar (+ styles), Button/Input/TextField/Form/InfoField/
  Modal/SearchField/Table/Tabs/DropDown/ThreeDotMenu/Logo/Toast(+store/api/types)/
  NotFound/Unauthorized, themes/typography/utilities SCSS. Branch
  dashboard-implementation has uncommitted edits (Sidebar, routes.constants,
  RouteFactory, NoOrganization) — commit or stash before audit sign-off.
Remaining: responsive pass + dark/light wiring (themes.scss + theme.store exist,
  no toggle in Navbar — add), a11y labels on icon buttons, remove dead
  DASHBOARD commented line in ComponentFactory (:25).

[I] Testing / DevOps (frontend slice)
--------------------------------------------------------------------------------
Status: NOT STARTED. No *.test.* / *.spec.* under frontend/src (glob confirms only
  .tsx/.ts/.scss/.svg). No Dockerfile/CI for frontend beyond vite defaults.
  (Mirrors backend: no test suites yet — backend P2 item covers both.)

================================================================================
ROUTE TABLE — DEFINED vs REAL (constants/routes.constants.ts + ComponentFactory)
================================================================================
  HOME           /                requiresAuth+requireOrg  | REAL (dummy data) | Home.tsx
  LOGIN          /login           public                  | REAL (API)        | Login.tsx
  REGISTER       /register        public                  | REAL (API)        | Register.tsx
  NOORGANIZATION /no-organization auth, no org            | REAL (static)     | NoOrganization.tsx
  ONBOARDING     /onboarding      auth, no org            | SHELL (dummy)     | Onboarding.tsx
  PROFILE        /profile         auth+org                | REAL (display)    | Profile.tsx
  PROJECTS       /projects        auth+requireOrg         | NotFound (TODO)   | —
  TASKS          /tasks           auth+requireOrg         | NotFound (TODO)   | —
  USERS          /users           auth+requireOrg         | NotFound (TODO)   | —
  ORGANIZATION   /organization    auth+requireOrg         | NotFound (TODO)   | —
  NOTIFICATION   /notification    auth+requireOrg         | NotFound (TODO)   | — (backend also missing)
  SETTINGS       /settings        auth+requireOrg         | NotFound (TODO)   | —

================================================================================
REMAINING WORK — PRIORITIZED (frontend-only; backend deps noted)
================================================================================
P0 — WIRING (no backend work needed, backend already DONE):
  [F-P0-1] Home -> useHomeDashboard + useCreateTask (see [C] 1-2). ~1 day. Unlocks demo.
  [F-P0-2] Onboarding -> useCreateOrganization (FormData) + nav (see [D]). ~half day.
  [F-P0-3] Fix Create-org navigation (NoOrgCard -> ONBOARDING), remove RouteFactory
           console.log, commit/stash 4 dirty files (git status, branch
           dashboard-implementation).
P1 — PAGES (backend DONE, build UI):
  [F-P1-1] PROJECTS list+details+members (8 APIs ready). Reuse Table/SearchField/Modal.
  [F-P1-2] TASKS board+details+assign (6 APIs ready). Reuse panels + Tabs/DropDown.
  [F-P1-3] USERS members+roles+leave+transfer (org member APIs ready).
  [F-P1-4] ORGANIZATION settings + PROFILE edit form (PATCH endpoints ready).
P2 — BLOCKED ON BACKEND (do NOT build beyond empty-states):
  [F-P2-1] NOTIFICATION inbox (needs backend V2 notifications API).
  [F-P2-2] Dashboard aggregates (backend P1-2) to replace client fan-out at scale.
  [F-P2-3] Change-password form (needs PATCH /auth/me/password).
P3 — POLISH (spec Frontend + State sections):
  Loading/error/empty per page, search/filter/sort/pagination wiring + URL-state,
  optimistic updates + infinite queries, responsive, theme toggle, toasts on every
  mutation, remove dummy fallbacks, tests (component + e2e), Docker/CI.

ESTIMATED REMAINING: P0 wiring ~1-2 days; P1 pages ~1-2 weeks (4 pages × CRUD);
P2 blocked; P3 polish ongoing. Frontend is the critical path — backend MVP is
demonstrable via Swagger/curl today, but not yet via UI.

================================================================================
FILE REFERENCES (verified 2026-10-13)
================================================================================
  router.ts                          — rootRoute + createAppRoutes wiring
  factories/RouteFactory.tsx:36-68  — guards + org ensureQueryData (:55) + LOG (:58 REMOVE)
  factories/ComponentFactory.tsx:7   — lazy map; :19-24 six NotFound placeholders
  constants/routes.constants.ts      — 12 routes (HOME..SETTINGS)
  constants/sidebar.constants.ts     — sidebar items (key prop fixed recently)
  features/auth/pages/Login|Register — REAL forms + api files
  features/auth/api/auth.api.ts      — authMe() boot (App.tsx:9,13-19 once-promise)
  features/auth/components/Profile   — display-only (needs edit form)
  features/home/api/home.api.ts:38   — org queryOptions | :53 createOrg | :169 dashboard
                                     :237 createTask (both dashboard hooks UNUSED)
  features/home/pages/home/Home.tsx:44 — "Dummy-only" flag + dummy useState (:51-55)
  features/home/data/home.dummy.ts   — DUMMY_* (delete after wiring, keep for tests)
  features/home/pages/noorganization/NoOrganization.tsx — static cards; create btn
                                     self-navigates (:30 — should be ONBOARDING)
  features/home/pages/onboarding/Onboarding.tsx:11 — "Dummy-only" flag; form shell
  components/layouts/*               — RootLayout/Navbar(org switch)/Sidebar
  components/ui/*                    — Button/Table/Form/Input/Modal/Search/Tabs/Toast/...
  store/auth|org|theme|toast|store   — Zustand split (good)
  hooks/useApi.ts + useActiveOrg.ts  — wrappers (good)
  configs/api.ts + api.interceptor.ts— Bearer + silent flag

================================================================================
VERIFICATION NOTES
================================================================================
  - Route reality from ComponentFactory lazy map (not just constants): 6 map to
    NotFound — that is the authoritative "not built" signal.
  - Dummy flags are explicit in-code comments (Home.tsx:44, Onboarding.tsx:11) —
    not inferred. Dashboard hooks verified present-but-uncalled (no import of
    useHomeDashboard/useCreateTask outside home.api.ts).
  - Backend readiness per endpoint verified against backend/REMAINING_TASKS_AUDIT.md
    (2026-10-13 refresh): all P0/P1 page APIs exist; only notifications/password/
    aggregates are truly blocked.
  - Dirty tree noted: git status shows M Sidebar.tsx, routes.constants.ts,
    RouteFactory.tsx, NoOrganization.tsx on branch dashboard-implementation.

================================================================================
END OF REPORT (2026-10-13)
================================================================================
