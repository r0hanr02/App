# ✅❌ Routes Status — Multi-Tenant Developer Collaboration Platform

> **Base URL:** `/api/v1` (mounted in `backend/index.ts:36-39` — auth under `/api/v1/auth`)
> **Date:** 2026-09-30
> **Spec:** `backend/multi-tenant-project-platform-features.md`
> **Swagger:** `backend/src/docs/swagger.ts:1` (`GET /api/v1/docs`)
> **Previous audit:** 2026-09-24 (14 routes) → 2026-09-30 (28 routes) → re-verified 2026-09-30 on branch `Task-APIs` (30 API routes confirmed via grep, no new files)

### Legend
| Sign | Meaning |
|------|---------|
| ✅ | **DONE** — Route exists, path matches spec, happy path works |
| ⚠️ | **PARTIAL** — Route exists but logic/middleware/guard differs from spec or Swagger |
| ❌ | **NOT CREATED** — No route / controller / model yet |

**Total in code:** 30 API routes + 3 system (`/`, `/health`, `/docs`)
**Spec expected (MVP: User → Org → Project → Task):** ~30 core REST routes
**Coverage:** ~27/30 core routes exist (~90% by count). Remaining gaps are task update/delete, invitations, comments/attachments/activity, dashboards, search, notifications, realtime.

---

## Tenant-isolation pattern (middleware vs controller)

> Verified 2026-09-30. This answers "no need to re-check project/org in controllers".

| Layer | Responsibility | File |
|-------|----------------|------|
| `authMiddleware` | Bearer JWT → `req.userId` / `req.user`, 401 on missing/expired | `src/middlewares/auth-middleware.ts:15` |
| `requireOrganizationMember` | Validates `organizationId` format, org exists (404), caller is org member (403), sets `req.organizationMember` | `src/middlewares/auth-organization-member.ts:7` |
| `requireOrganizationRole(...)` | Checks `req.organizationMember.role` ∈ allowed, 403 otherwise | `src/middlewares/auth-required-role.ts:7` |
| `requireProjectAccess` | Validates `projectId`+`organizationId` format, project exists (404), `project.organization_id == organizationId` (403), sets `req.project`; OWNER/ADMIN bypass, MEMBER needs `ProjectMember` row (403) | `src/middlewares/auth-project-member.ts:7` |
| `requireTaskAccess` | Validates `taskId` format (400), proves task belongs to project/org + not soft-deleted (404), sets `req.task`. Must run AFTER `requireProjectAccess` | `src/middlewares/auth-task-access.ts:7` |

**Rule:**
- ✅ Controllers behind `requireOrganizationMember` must NOT re-validate org existence/membership — redundant DB hit.
- ✅ Controllers behind `requireProjectAccess` must NOT re-`find` Project or re-check `project-belongs-to-org` — middleware already did it.
- ✅ Controllers behind `requireTaskAccess` must NOT re-`find` Task or re-check task scoping — use `req.task` (populates/mutates directly).
- Current state: `task-controller.ts` is lean (correct). `project-controller.ts` + `organization-controller.ts` still re-validate IDs/existence/belonging inline (harmless, double DB hit — cleanup opportunity, not a bug). Fixed 2026-09-30: task scoping extracted from `getTaskDetails`/`assignTask` into `requireTaskAccess` (was inline `findOne` = correct but duplicated).

---

## ✅ DONE — You can call these right now

### System / Docs
| Status | Method | Route | Handler | File |
|--------|--------|-------|---------|------|
| ✅ | `GET` | `/` | Hello World | `backend/index.ts:43` |
| ✅ | `GET` | `/health` | `{ success:true, message:"OK" }` | `backend/index.ts:47` |
| ✅ | `GET` | `/api/v1/docs` | Swagger UI | `backend/index.ts:41` + `src/docs/swagger.ts:1` |

### Authentication & User — `backend/src/routes/user-routes.ts:1` (mounted at `/api/v1/auth`)
| Status | Method | Route | Handler | Notes |
|--------|--------|-------|---------|-------|
| ✅ | `POST` | `/api/v1/auth/register` | `registerUser` | `user-routes.ts:16` → `user-auth-controller.ts:16` — multipart (`profilepic?`) + `{ name, email, password, phone, dateOfBirth? }` · 201 · 409 duplicate email · phone required by model (ValidationError 400 if missing) |
| ✅ | `POST` | `/api/v1/auth/login` | `loginUser` | `user-routes.ts:17` → `user-auth-controller.ts:58` — returns `accessToken` + httpOnly `refreshToken` cookie · 401 invalid credentials, 404 user not found |
| ✅ | `POST` | `/api/v1/auth/logout` | `logout` | `user-routes.ts:18` → `user-auth-controller.ts:105` — always 200, clears cookie |
| ✅ | `POST` | `/api/v1/auth/refresh` | `refreshToken` | `user-routes.ts:19` → `user-auth-controller.ts:141` — cookie → new `accessToken` (no rotation) · 401 missing, 403 invalid |
| ✅ | `PATCH` | `/api/v1/auth/me` | `updateMe` | `user-routes.ts:21` → `authMiddleware` + `upload.single` + `user-auth-controller.ts:211` — updates `name/email/phone/dateOfBirth/profilepic` · 400 empty body, 409 email taken |
| ⚠️ | `GET` | `/api/v1/auth/me` | `authMe` | `user-routes.ts:20` → `user-auth-controller.ts:165` — **no `authMiddleware`**; verifies *refresh cookie* directly and **rotates both tokens**. Works but unconventional for `GET` (side-effect + no Bearer support). Consider `GET /me` with Bearer or rename to `POST /auth/refresh-rotate` |

### Organization — `backend/src/routes/organization-routes.ts:1` (mounted at `/api/v1`)
| Status | Method | Route | Handler | Notes |
|--------|--------|-------|---------|-------|
| ✅ | `POST` | `/api/v1/organization` | `createOrganization` | `organization-routes.ts:20` → `organization-controller.ts:24` — `{ organization_name, slug? }` · auth only · creator → `OWNER` · transaction · 409 duplicate |
| ✅ | `GET` | `/api/v1/organization` | `getAllOrganization` | `organization-routes.ts:21` → `organization-controller.ts:85` — returns `OrganizationMember[]` for caller (populates `organization_id.organization_name`) |
| ✅ | `GET` | `/api/v1/organization/:organizationId` | `getOrganization` | `organization-routes.ts:22` → `auth` + `requireOrganizationMember` + `organization-controller.ts:99` |
| ✅ | `GET` | `/api/v1/organization/:organizationId/member` | `getOrganizationMembers` | `organization-routes.ts:28` → `organization-controller.ts:118` — populates `user_id {name,email}` |
| ✅ | `PATCH` | `/api/v1/organization/:organizationId` | `updateOrganizationData` | `organization-routes.ts:54` → `auth` + `member` + `OWNER,ADMIN` + `organization-controller.ts:249` — spec path (no `/update` suffix) ✅ fixed since 09-24 audit |
| ✅ | `DELETE` | `/api/v1/organization/:organizationId` | `deleteOrganization` | `organization-routes.ts:34` → `auth` + `member` + `OWNER` + `organization-controller.ts:191` — cascade in transaction: Tasks → ProjectMembers → Projects → OrgMembers → Org |
| ✅ | `DELETE` | `/api/v1/organization/:organizationId/me` | `leaveOrganization` | `organization-routes.ts:41` → `organization-controller.ts:136` — blocks last OWNER, cleans up `ProjectMember` rows |
| ✅ | `DELETE` | `/api/v1/organization/:organizationId/member/me` | `leaveOrganization` (alias) | `organization-routes.ts:48` — spec alias, same handler |
| ✅ | `POST` | `/api/v1/organization/:organizationId/transfer-ownership` | `transferOwnership` | `organization-routes.ts:87` → `auth` + `member` + `OWNER`-only + `organization-controller.ts:500` — body `{ targetUserId }` (falls back to `user_id`) · target must be org member (404) · rejects self-transfer + already-OWNER (400) · transaction `target→OWNER`, `requester→ADMIN` · implemented 2026-09-30 |

### Organization Members
| Status | Method | Route | Handler | Notes |
|--------|--------|-------|---------|-------|
| ✅ | `POST` | `/api/v1/organization/:organizationId/member` | `addMember` | `organization-routes.ts:64` → `auth` + `member` + `OWNER,ADMIN` + `organization-controller.ts:292` — `{ user_id, role: ADMIN\|MEMBER }` · blocks `OWNER` (use transfer-ownership) · only `OWNER` can assign `ADMIN` · 409 duplicate |
| ✅ | `PATCH` | `/api/v1/organization/:organizationId/member/:userId` | `changeMemberRole` | `organization-routes.ts:72` → `auth` + `member` + `OWNER`-only + `organization-controller.ts:365` — spec path with `:userId` ✅ fixed · blocks `OWNER` assignment + last-OWNER demotion |
| ✅ | `DELETE` | `/api/v1/organization/:organizationId/member/:userId` | `removeMember` | `organization-routes.ts:79` → `auth` + `member` + `OWNER,ADMIN` + `organization-controller.ts:448` — blocks self-removal (use leave) + last-OWNER removal |

### Project — `backend/src/routes/project-routes.ts:1` (mounted at `/api/v1`)
| Status | Method | Route | Handler | Notes |
|--------|--------|-------|---------|-------|
| ✅ | `POST` | `/api/v1/organization/:organizationId/projects` | `createProject` | `project-routes.ts:19` → `auth` + `member` + `OWNER,ADMIN` + `project-controller.ts:14` — plural path ✅ · `{ project_name }` · transaction creates `Project` + creator `ProjectMember` · 409 duplicate name |
| ⚠️ | `GET` | `/api/v1/organization/:organizationId/projects` | `getAllProject` | `project-routes.ts:27` → `auth` + `member` + `OWNER,ADMIN` + `project-controller.ts:71` — **MEMBER role blocked** (403) even for own projects; no `?search/page/limit/sort`. Relax to all org members or filter by `ProjectMember` |
| ✅ | `GET` | `/api/v1/organization/:organizationId/projects/:projectId` | `getProject` | `project-routes.ts:36` → `auth` + `member` + `requireProjectAccess` + `project-controller.ts:92` — MEMBER allowed if project member (OWNER/ADMIN bypass via middleware) |
| ⚠️ | `PATCH` | `/api/v1/organization/:organizationId/projects/:projectId` | `updateProject` | `project-routes.ts:44` → `auth` + `member` + `OWNER,ADMIN` + `project-controller.ts:138` — spec path ✅ but **missing `requireProjectAccess`** (inconsistent with GET/DELETE; controller does inline belonging check so still safe — add middleware for consistency) |
| ✅ | `DELETE` | `/api/v1/organization/:organizationId/projects/:projectId` | `deleteProject` | `project-routes.ts:82` → `auth` + `member` + `OWNER` + `requireProjectAccess` + `project-controller.ts:343` — transaction cascade: `Task.deleteMany` + `ProjectMember.deleteMany` + `Project` |
| ✅ | `POST` | `/api/v1/organization/:organizationId/projects/:projectId/members` | `addMemberInProject` | `project-routes.ts:55` → `auth` + `member` + `OWNER,ADMIN` + `requireProjectAccess` + `project-controller.ts:181` — `{ user_id }` · target must exist + be org member · 409 duplicate |
| ✅ | `GET` | `/api/v1/organization/:organizationId/projects/:projectId/members` | `getAllMemberInProject` | `project-routes.ts:64` → same chain + `project-controller.ts:259` — populates `user_id {name,email}` |
| ✅ | `DELETE` | `/api/v1/organization/:organizationId/projects/:projectId/members/:userId` | `removeMemberFromProject` | `project-routes.ts:73` → same chain + `project-controller.ts:298` — removes from project only (stays in org) · 404 if not member |

### Task — `backend/src/routes/task-routes.ts:1` (mounted at `/api/v1`)
| Status | Method | Route | Handler | Notes |
|--------|--------|-------|---------|-------|
| ⚠️ | `POST` | `/api/v1/organization/:organizationId/projects/:projectId/tasks` | `createTask` | `task-routes.ts:9` → `auth` + `member` + `OWNER,ADMIN` + `requireProjectAccess` + `task-controller.ts:13` — builds `taskData` with explicit `status`/`priority`/`type` enum validation (400) ✅ · GAPS vs Swagger: `assignee_id` currently **required** (should be optional), no org-membership check on assignee (only `User.exists`), no explicit `task_name`/`due_date` validation (relies on Mongoose), returns **200 not 201**. Works but tighten to match `swagger.ts:3402` |
| ⚠️ | `GET` | `/api/v1/organization/:organizationId/projects/:projectId/tasks` | `getAllTask` | `task-routes.ts:27` → `auth` + `member` + `requireProjectAccess` (no role gate — all project members) + `task-controller.ts:89` — filters `?status=&priority=&type=&assignee_id=` ✅ · fixed 2026-09-30: invalid filters now `throw AppError` (standard `{success:false}` shape, was raw `res.status(400).json`) · STILL MISSING vs Swagger (`swagger.ts:3402,3579`): `?search=` full-text, `sort createdAt:-1`, pagination `page/limit`. Add to match docs |
| ✅ | `GET` | `/api/v1/organization/:organizationId/projects/:projectId/tasks/:taskId` | `getTaskDetails` | `task-routes.ts:18` → `auth` + `member` + `requireProjectAccess` + `requireTaskAccess` + `task-controller.ts` — scoping via middleware (`req.task`, populated `assignee/creator {name}`). No role gate (any project member) — intended |
| ✅ | `PATCH` | `/api/v1/organization/:organizationId/projects/:projectId/tasks/:taskId/assign` | `assignTask` | `task-routes.ts:36` → `auth` + `member` + `OWNER,ADMIN` + `requireProjectAccess` + `requireTaskAccess` + `task-controller.ts:185` — body `{ assignee_id }` (`null`/`""`/omitted = unassign) · scoping via middleware (`req.task`, 400/404) · assignee must exist (404) + be org member (400) · returns populated task · added 2026-09-30 |

---

## ⚠️ PARTIAL — Exists but needs tightening (no path change needed)

| # | Route | File | Issue / Action |
|---|-------|------|----------------|
| 1 | `GET /api/v1/auth/me` | `user-routes.ts:20` → `user-auth-controller.ts:165` | No `authMiddleware`, cookie-only, rotates tokens on GET. **Action:** add Bearer variant or document as refresh-rotate; add test |
| 2 | `POST .../tasks` | `task-controller.ts:13` | `assignee_id` required, no org-member check, 200 not 201. **Action:** make optional, check `OrganizationMember`, return 201 (see `swagger.ts:3402`) |
| 3 | `GET .../tasks` | `task-controller.ts:89` | ~~No `search`/`sort`/`page`/`limit` despite Swagger~~ error shape fixed 2026-09-30 (now `throw AppError`); still no `search`/`sort`/`page`/`limit`. **Action:** add `$text` search + `.sort({createdAt:-1})` + pagination |
| 4 | `GET .../projects` | `project-routes.ts:27` | `OWNER,ADMIN` only — `MEMBER` gets 403. **Action:** allow all org members (filter by membership for MEMBER) |
| 5 | `PATCH .../projects/:projectId` | `project-routes.ts:44` | Missing `requireProjectAccess`. **Action:** add middleware, drop inline belonging check |
| 6 | Response shape | org/project/task controllers | Return `{ message, data }` (no `success`), auth returns `{ success, ... }`. **Action:** standardize (Swagger already documents the split — pick one) |

### Model / index quirks (not route-breaking, fix soon)
| Area | File | Issue |
|------|------|-------|
| `Project.project_name` | `project-model.ts:9` | `unique:true` is **global** — two orgs can't reuse a name. Should be compound `{ organization_id, project_name }` unique (controller already checks per-org, but race + wrong 409 message). **Action:** drop global unique, add compound index |
| `Project` fields | `project-model.ts:3` | Only `project_name` + `organization_id`. Missing spec fields: `description`, `status`, `visibility`, `dates`, `slug/key` |
| Redundant validation | `project-controller.ts:23-28,75-80,100-118,151-168,192-211,271-286,309-325,353-370`, `organization-controller.ts:103,122,141,195,253,301,374,452` | Re-validates IDs/existence/belonging already covered by middleware. Harmless (extra DB read) — **Action (cleanup):** trust `req.organizationMember` / `req.project`, keep only scoping/business checks |
| `GET /organization` shape | `organization-controller.ts:85` | Returns memberships, not orgs (populates only `organization_name`). Fine but document; consider `?shape=orgs` later |

---

## ❌ NOT CREATED YET

### Auth / User
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `PATCH` | `/api/v1/auth/me/password` | Change password (old + new, re-hash, revoke refresh) |
| ❌ | `GET` | `/api/v1/users/:userId` | Optional public/lookup (spec: account validation) |

### Organization — transfer-ownership ✅ DONE (moved from ❌ 2026-09-30, see Organization table above)

### Invitations — *entire section missing*
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `POST` | `/api/v1/organization/:organizationId/invitations` | Invite by email → token + expiry |
| ❌ | `GET` | `/api/v1/organization/:organizationId/invitations` | Pending list |
| ❌ | `POST` | `/api/v1/invitations/:token/accept` | Accept |
| ❌ | `POST` | `/api/v1/invitations/:token/reject` | Reject |
| ❌ | `DELETE` | `/api/v1/organization/:organizationId/invitations/:invitationId` | Cancel |
> Need model `Invitation { organization_id, email, token, expiresAt, status: pending\|accepted\|rejected\|expired, invitedBy }` + BullMQ cleanup later

### Project — remaining
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `GET` | `/api/v1/organization/:organizationId/projects?search=&status=&visibility=&sort=&page=&limit=` | Search/filter/sort/pagination — `getAllProject` returns all, no query support |

### Project members — remaining
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `PATCH` | `/api/v1/organization/:organizationId/projects/:projectId/members/:userId` | Optional — project roles (`Project Admin`/`Developer`/`Viewer`). Currently no per-project role field |

### Task — remaining (model DONE, routes partial)
> Model DONE: `src/models/task-model.ts:1` — `task_name`, `description`, `status`, `priority`, `type`, `due_date`, `project_id`, `organization_id`, `creator_id`, `assignee_id`, `is_deleted`, timestamps + indexes (`organization_id+project_id`, `status+priority`, `assignee`, `due_date`, `is_deleted`, text `task_name+description`)

| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `PATCH` | `/api/v1/organization/:organizationId/projects/:projectId/tasks/:taskId` | Update task (title/desc/status/priority/type/due_date) |
| ❌ | `DELETE` | `/api/v1/organization/:organizationId/projects/:projectId/tasks/:taskId` | Soft-delete (`is_deleted:true`) — model already supports it |

### Task Comments / Attachments / Activity
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `POST/GET` | `/api/v1/.../tasks/:taskId/comments` | Add + list |
| ❌ | `PATCH/DELETE` | `/api/v1/.../tasks/:taskId/comments/:commentId` | Edit + delete |
| ❌ | `POST/GET/DELETE` | `/api/v1/.../tasks/:taskId/attachments[/:attachmentId]` | Upload (multer type/size) / download / delete |
| ❌ | `GET` | `/api/v1/.../tasks/:taskId/activity` | Task feed |
| ❌ | `GET` | `/api/v1/organization/:organizationId/activity` | Org audit log |
> Need `Comment { task_id, author, text, mentions[], timestamps }`, `Attachment` + storage, activity emitter (task created / status / assign / priority / dueDate / comment / member events)

### Dashboards / Search / Notifications
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `GET` | `/api/v1/organization/:organizationId/dashboard` | Project/member/task counts, completed/pending, by status/priority, recent projects/activity |
| ❌ | `GET` | `/api/v1/organization/:organizationId/projects/:projectId/dashboard` | Task counts, overdue, members, recent activity |
| ❌ | `GET` | `/api/v1/organization/:organizationId/search?q=&type=project\|task\|member` | Cross-entity search |
| ❌ | `GET` | `/api/v1/notifications` | Inbox |
| ❌ | `PATCH` | `/api/v1/notifications/:notificationId/read` | Mark read |
| ❌ | `POST` | `/api/v1/notifications/read-all` | Mark all read |

### Realtime / Infra / RBAC / Admin (unchanged from 09-24)
| Status | Area | Notes |
|--------|------|-------|
| ❌ | **WebSockets** | Task/comment/notification/member/presence/typing/dashboard/channels/DM |
| ❌ | **Redis** | Cache, rate-limit (fixed/sliding/token-bucket), Pub/Sub, presence, queues |
| ❌ | **Background Jobs** | Email invites/notifications, expired-invite cleanup, reports (`API → Redis → Worker`) |
| ❌ | **WebRTC** | Create/join/leave, audio/video/screen, signaling via WS |
| ❌ | **Chat** | Org/project channels, DM/group, messages, reactions, read status, search, files (`React → Socket.IO → Express → Redis → Mongo`) |
| ❌ | **RBAC central** | `src/utils/permissions.ts` matrix (`organization.*`, `project.*`, `task.*`) — checks currently scattered in `auth-required-role.ts`, `auth-organization-member.ts`, `auth-project-member.ts` |
| ❌ | **Security/Admin** | Login history, failed-login tracking, refresh rotation on `POST /refresh`, CORS/headers tests, request logging (pino-http ✅ partial), versioning `/api/v2`, `/admin/*` (suspend, analytics) |
| ✅/❌ | **Indexes** | ✅ `OrganizationMember(org,user)` unique, `ProjectMember(project,user)` unique, `Task(org+project, org+status+priority, org+assignee, org+due_date, org+is_deleted, text)` · ❌ `Project(organization_id)` index, `Task(project_id)` single-field, compound search, soft-delete partial |

---

## Quick Next Steps — Suggested order

1. **Task gaps (highest value):** `PATCH /tasks/:taskId` + `DELETE` (soft) — 2 handlers, reuse `requireProjectAccess` + scoped `findOne`. Then add `?search/page/limit/sort` to `getAllTask` to match Swagger.
2. **Tighten `POST /tasks`:** optional `assignee_id` + org-member check + `201` (align with `swagger.ts:3402`).
3. **Project list for MEMBER + `requireProjectAccess` on PATCH project** (2-line route fixes).
4. **Compound unique** `{ organization_id, project_name }` + `Project(organization_id)` index.
5. **Invitations** model + 5 routes (later phase but high user value).
6. **Standardize response shape** (`{ success, message, data }` vs `{ message, data }`).

---

## File Map — Where to look

| Area | Files |
|------|-------|
| **Routes** | `src/routes/user-routes.ts:1`, `organization-routes.ts:1`, `project-routes.ts:1`, `task-routes.ts:1`, `index.ts:1` (exports) |
| **Controllers** | `src/controllers/user-auth-controller.ts:1`, `organization-controller.ts:1`, `project-controller.ts:1`, `task-controller.ts:1` |
| **Models** | `src/models/user-model.ts:1`, `organization-model.ts:1`, `project-model.ts:1`, `task-model.ts:1`, `index.ts:1` |
| **Middlewares** | `src/middlewares/auth-middleware.ts:1`, `auth-organization-member.ts:7`, `auth-required-role.ts:7`, `auth-project-member.ts:7`, `auth-task-access.ts:7`, `error-middleware.ts:1`, `upload-middleware.ts:1` |
| **Entry** | `backend/index.ts:1` (mounts at `/api/v1/auth:36`, `/api/v1:37-39`, docs `:41`) |
| **Docs** | `src/docs/swagger.ts:1` (OpenAPI 3.0 — task POST/GET docs are *ahead* of implementation; org/project/task member docs match code) |
| **Spec** | `multi-tenant-project-platform-features.md:1`, `multi-tenant-platform-rules.md:1`, `MVP_V1.md:1` |

---

> **Swagger:** `http://localhost:8000/api/v1/docs`
> **Changelog 2026-09-30:** re-audited all 4 routers + 4 controllers + 4 middlewares + 4 models; fixed `getTaskDetails` tenant scoping (`task-controller.ts:58`); confirmed `requireOrganizationMember` 403 flaw from 09-24 is fixed; confirmed org PATCH/member paths now spec-compliant; moved task create/list/details from ❌ to ⚠️/✅; added PARTIAL table + model quirks + middleware-vs-controller rule.
> **Changelog 2026-09-30 (re-verify, branch `Task-APIs`):** grep-verified all `router.*` registrations (org 12 + project 8 + user 6 + task 3 = 29, no new files); all doc line numbers / middleware chains / handler notes still accurate; fixed `getAllTask` invalid-filter errors to `throw AppError` (standard shape); removed stray `// router.patch()` placeholder in `task-routes.ts`; `tsc --noEmit` clean.
> **Changelog 2026-09-30 (transfer-ownership):** user wired `POST /organization/:organizationId/transfer-ownership` (`organization-routes.ts:87`, auth + member + OWNER) with empty stub; implemented `transferOwnership` (`organization-controller.ts:500`) — `{ targetUserId }` (+`user_id` fallback), 400 self/already-owner, 403 non-OWNER, 404 non-member target, transaction `target→OWNER`/`requester→ADMIN`; moved from ❌ to ✅ (29 routes); `tsc --noEmit` clean.
> **Changelog 2026-09-30 (task assign):** added `PATCH /organization/:organizationId/projects/:projectId/tasks/:taskId/assign` (`task-routes.ts:36`, auth + member + OWNER/ADMIN + `requireProjectAccess` + `requireTaskAccess`) + `assignTask` (`task-controller.ts:185`) — owner/admin assigns any project task to an org member, `null`/`""`/omitted unassigns; scoping via middleware (400/404), assignee exists (404) + org member (400); moved from ❌ to ✅ (30 routes); `tsc --noEmit` clean.
> **Changelog 2026-09-30 (partial re-verify):** re-checked all 6 PARTIAL items + model quirks against current code (`task-controller.ts:13-151`, `project-routes.ts` guards via grep, `project-model.ts:9`, `user-routes.ts:20`): no code drift — `POST /tasks` still requires `assignee_id`/returns 200, `GET /tasks` still no search/sort/page, `GET /projects` still OWNER/ADMIN-only, `PATCH /projects/:projectId` still missing `requireProjectAccess`, `GET /auth/me` still cookie-only, `project_name` still globally unique. Doc descriptions accurate, no fix needed.
> **Changelog 2026-09-30 (requireTaskAccess):** extracted task scoping into `src/middlewares/auth-task-access.ts:7` (`requireTaskAccess` — validates `taskId`, tenant-scoped `findOne` + `is_deleted:false`, attaches `req.task`); `getTaskDetails`/`assignTask` now use `req.task` (inline `findOne` removed); wired into both `:taskId` routes after `requireProjectAccess`; PARTIAL #2 updated (`createTask` enum validation now explicit); `tsc --noEmit` clean.
