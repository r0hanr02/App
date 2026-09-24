# ✅❌ Routes Status — Multi-Tenant Developer Collaboration Platform

> **Base URL:** `/api/v1` (mounted in `backend/index.ts:33-35`)  
> **Date:** 2026-09-24  
> **Spec:** `backend/multi-tenant-project-platform-features.md`  
> **Audit detail:** `backend/REMAINING_TASKS_AUDIT.txt`

### Legend
| Sign | Meaning |
|------|---------|
| ✅ | **DONE** — Route exists and works (happy path) |
| ⚠️ | **PARTIAL** — Route exists but path differs from spec or logic incomplete |
| ❌ | **NOT CREATED** — No route / controller / model yet |

**Total in code:** 14 API routes + 2 system (`/`, `/health`, `/docs`)  
**Spec expected (MVP):** ~22 core REST routes (excluding Task/Invite/Chat later)  
**Coverage:** ~14/22 core routes exist (64% by count, ~40% by correctness)

---

## ✅ DONE — You can call these right now

### System / Docs
| Status | Method | Route | Handler | File |
|--------|--------|-------|---------|------|
| ✅ | `GET` | `/` | Hello World | `backend/index.ts:39` |
| ✅ | `GET` | `/health` | `{ success:true, message:"OK" }` | `backend/index.ts:43` |
| ✅ | `GET` | `/api/v1/docs` | Swagger UI | `backend/index.ts:37` |

### Authentication & User — `backend/src/routes/user-routes.ts:1`
| Status | Method | Route | Handler | File |
|--------|--------|-------|---------|------|
| ✅ | `POST` | `/api/v1/register` | `registerUser` | `user-routes.ts:6` → `controllers/user-auth-controller.ts:10` |
| ✅ | `POST` | `/api/v1/login` | `loginUser` (+ httpOnly `refreshToken` cookie) | `user-routes.ts:7` → `user-auth-controller.ts:44` |
| ✅ | `POST` | `/api/v1/logout` | `logout` (clears cookie) | `user-routes.ts:8` → `user-auth-controller.ts:88` |
| ✅ | `POST` | `/api/v1/refresh` | `refreshToken` (cookie → new accessToken) | `user-routes.ts:9` → `user-auth-controller.ts:124` |

### Organization — `backend/src/routes/organization-routes.ts:1`
| Status | Method | Route | Handler | Notes |
|--------|--------|-------|---------|-------|
| ✅ | `POST` | `/api/v1/organization` | `createOrganization` | `organization-routes.ts:20` → `organization-controller.ts:16` — Body `{ organization_name, slug? }` · Auth required · Creator becomes `OWNER` · Transaction |
| ✅ | `GET` | `/api/v1/organization` | `getAllOrganization` | `organization-routes.ts:21` → `organization-controller.ts:75` — Returns `OrganizationMember[]` for current user |
| ✅ | `GET` | `/api/v1/organization/:organizationId` | `getOrganization` | `organization-routes.ts:22` → `organization-controller.ts:86` |
| ✅ | `GET` | `/api/v1/organization/:organizationId/member` | `getOrganizationMembers` | `organization-routes.ts:28` → `organization-controller.ts:103` — Populates `user_id {name,email}` |

### Organization Members
| Status | Method | Route | Handler | Notes |
|--------|--------|-------|---------|-------|
| ✅ | `POST` | `/api/v1/organization/:organizationId/member` | `addMember` | `organization-routes.ts:57` → `organization-controller.ts:191` — Body `{ user_id, role: ADMIN\|MEMBER }` · Blocks `OWNER` assignment · Only `OWNER` can assign `ADMIN` |
| ✅ | `DELETE` | `/api/v1/organization/:organizationId/member/:userId` | `removeMember` | `organization-routes.ts:72` → `organization-controller.ts:309` — Blocks self-removal + last `OWNER` removal |
| ✅ | `DELETE` | `/api/v1/organization/:organizationId` | `removeOrganization` | `organization-routes.ts:34` → `organization-controller.ts:141` — `OWNER` only · Deletes Org + OrgMembers |
| ✅ | `DELETE` | `/api/v1/organization/:organizationId/leave` | `leaveOrganization` | `organization-routes.ts:41` → `organization-controller.ts:119` |

### Project — `backend/src/routes/project-routes.ts:1`
| Status | Method | Route | Handler | Notes |
|--------|--------|-------|---------|-------|
| ✅ | `POST` | `/api/v1/organization/:organizationId/project` | `createProject` | `project-routes.ts:15` → `project-controller.ts:8` — Body `{ project_name }` · `OWNER`/`ADMIN` only · Transaction creates `Project` + `ProjectMember(creator)` |
| ✅ | `GET` | `/api/v1/organization/:organizationId/projects` | `getAllProject` | `project-routes.ts:23` → `project-controller.ts:55` — `OWNER`/`ADMIN` only |
| ✅ | `GET` | `/api/v1/organization/:organizationId/projects/:projectId` | `getProject` | `project-routes.ts:32` → `project-controller.ts:76` — Tenant isolation checked (`project.organization_id === organizationId`) |

---

## ⚠️ PARTIAL — Exists but SPEC PATH / LOGIC MISMATCH

> These work but **DO NOT match spec path**. Fix by adding alias to spec path and keep old route for backward compat.

| Status | Current Route | Spec Expected | File | Issue / Action |
|--------|---------------|---------------|------|----------------|
| ⚠️ | `PATCH /api/v1/organization/:organizationId/update` | `PATCH /api/v1/organization/:organizationId` | `organization-routes.ts:47` → `organization-controller.ts:157` | Extra `/update` suffix. **Action:** Add alias without `/update`, keep as deprecated |
| ⚠️ | `PATCH /api/v1/organization/:organizationId/change-role` | `PATCH /api/v1/organization/:organizationId/member/:userId` + Body `{ role }` | `organization-routes.ts:65` → `organization-controller.ts:248` | Wrong path + body uses `{ user_id, role }` instead of param `:userId`. **Action:** Create `PATCH /member/:userId`, keep `/change-role` alias |
| ⚠️ | `DELETE /api/v1/organization/:organizationId/leave` | `DELETE /api/v1/organization/:organizationId/member/me` | `organization-routes.ts:41` → `organization-controller.ts:119` | **Action:** Add alias `DELETE /member/me` |
| ⚠️ | `POST /api/v1/organization/:organizationId/project` | `POST /api/v1/organization/:organizationId/projects` (plural) | `project-routes.ts:15` → `project-controller.ts:8` | Singular vs plural. **Action:** Add alias `POST /projects` |
| ⚠️ | `PATCH /api/v1/organization/:organizationId/projects/:projectId/update` | `PATCH /api/v1/organization/:organizationId/projects/:projectId` | `project-routes.ts:41` → `project-controller.ts:122` | Extra `/update`. **Action:** Add alias without `/update` |
| ⚠️ | `GET /api/v1/organization/:organizationId/projects/:projectId` | Same path but roles relaxed | `project-routes.ts:32` + `auth-project-member.ts:5` → `project-controller.ts:76` | Requires `OWNER`/`ADMIN` **AND** `requireProjectMember` — blocks `MEMBER` project-members. **Action:** Allow `OWNER`/`ADMIN` bypass |
| ⚠️ | `GET /api/v1/organization/:organizationId` & `GET /member` | — | `auth-organization-member.ts:5` | Tenant isolation flaw: `requireOrganizationMember` never returns `403` when not a member — always `next()`. Non-member could read org if they guess ID. Also `GET /organization` returns memberships array, not organizations. **Action:** Fix middleware to enforce `403` + add `populate` |

---

## ❌ NOT CREATED YET — No file / no route

### Authentication & User
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `GET` | `/api/v1/me` | Current-user endpoint (`/me`) — who am I |
| ❌ | `PATCH` | `/api/v1/me` | Profile update (`name`, `phone`, `dateOfBirth`) |
| ❌ | `PATCH` | `/api/v1/me/password` | Change password (old + new, re-hash) |
| ❌ | `GET` | `/api/v1/users/:userId` | Optional user lookup |

> Email uniqueness + password hashing + access/refresh tokens **are done** at model/controller level.

### Organization / Multi-Tenancy
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `POST` | `/api/v1/organization/:organizationId/transfer-ownership` | Body `{ targetUserId }` · Only `OWNER` · Target must be org member · Transaction: `target→OWNER`, `requester→ADMIN` · **HIGH priority** · File to create: `organization-controller.ts: add transferOwnership` |

### Organization Invitations — *Entire section missing*
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `POST` | `/api/v1/organization/:organizationId/invitations` | Invite user (email) → token + expiration |
| ❌ | `GET` | `/api/v1/organization/:organizationId/invitations` | Pending invitation list |
| ❌ | `POST` | `/api/v1/invitations/:token/accept` | Accept invitation |
| ❌ | `POST` | `/api/v1/invitations/:token/reject` | Reject invitation |
| ❌ | `DELETE` | `/api/v1/organization/:organizationId/invitations/:invitationId` | Cancel invitation |

> Need new model `Invitation { organization_id, email, token, expiresAt, status: pending\|accepted\|rejected\|expired, invitedBy }`

### Project Management — Remaining
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `DELETE` | `/api/v1/organization/:organizationId/projects/:projectId` | Delete/archive project · Only `OWNER` · Cascade: `ProjectMember` + `Tasks` + Comments + Attachments · `project-controller.ts` |
| ❌ | `GET` | `/api/v1/organization/:organizationId/projects?search=&status=&visibility=&sort=&page=&limit=` | Search/filter/sort/pagination — currently `getAllProject` returns all without query |

> **Model gap:** `Project` currently only has `project_name` + `organization_id` (`project-model.ts:4`). Missing `description`, `status`, `visibility`, `start/due dates`, `slug/key` from `features.md`.

### Project Members — *Entire section missing*
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `GET` | `/api/v1/organization/:organizationId/projects/:projectId/members` | List project members (populate user) |
| ❌ | `POST` | `/api/v1/organization/:organizationId/projects/:projectId/members` | Add project member — Body `{ user_id }` · Must be org member + not already project member · `OWNER`/`ADMIN` only · `409` if duplicate |
| ❌ | `DELETE` | `/api/v1/organization/:organizationId/projects/:projectId/members/:userId` | Remove project member — Does NOT remove from organization · `OWNER`/`ADMIN` only |
| ❌ | `PATCH` | `/api/v1/organization/:organizationId/projects/:projectId/members/:userId` | Optional later — project roles: `Project Admin` / `Developer` / `Viewer` |

> Need validation that target user belongs to same organization (`OrganizationMember` check).

### Task Management — *Entire subsystem missing — model orphaned*
> Model exists: `backend/src/models/task-model.ts:1` (only `task_name` + `project_id`) — needs extension.  
> Missing fields: `title`, `description`, `status (TODO/IN_PROGRESS/IN_REVIEW/DONE/CANCELLED)`, `priority (Low/Med/High/Critical)`, `type (Feature/Bug/...)`, `dueDate`, `creator`, `assignee`, `organization ref`, timestamps

| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `POST` | `/api/v1/organization/:organizationId/projects/:projectId/tasks` | Create task |
| ❌ | `GET` | `/api/v1/organization/:organizationId/projects/:projectId/tasks` | List tasks (filter by `status`/`priority`/`assignee`, search `title`/`description`, pagination, sort) |
| ❌ | `GET` | `/api/v1/organization/:organizationId/projects/:projectId/tasks/:taskId` | Task details |
| ❌ | `PATCH` | `/api/v1/organization/:organizationId/projects/:projectId/tasks/:taskId` | Update task |
| ❌ | `DELETE` | `/api/v1/organization/:organizationId/projects/:projectId/tasks/:taskId` | Delete task |
| ❌ | `PATCH` | `/api/v1/organization/:organizationId/projects/:projectId/tasks/:taskId/assign` | Assign/unassign — Body `{ assigneeId }` |

> Need: `src/controllers/task-controller.ts`, `src/routes/task-routes.ts`, `middlewares/validate-task-belongs-to-project.ts`

### Task Comments
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `POST` | `/api/v1/.../tasks/:taskId/comments` | Add comment |
| ❌ | `GET` | `/api/v1/.../tasks/:taskId/comments` | View comments |
| ❌ | `PATCH` | `/api/v1/.../tasks/:taskId/comments/:commentId` | Edit comment |
| ❌ | `DELETE` | `/api/v1/.../tasks/:taskId/comments/:commentId` | Delete comment |

> Need `Comment` model `{ task_id, author, text, mentions[], timestamps }`

### Task Attachments
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `POST` | `/api/v1/.../tasks/:taskId/attachments` | Upload (multipart, validate type/size) |
| ❌ | `GET` | `/api/v1/.../tasks/:taskId/attachments/:attachmentId` | Download |
| ❌ | `DELETE` | `/api/v1/.../tasks/:taskId/attachments/:attachmentId` | Delete |

> Need `Attachment` model + file storage (local → S3 later)

### Task Activity / Audit Log
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `GET` | `/api/v1/.../tasks/:taskId/activity` | Task activity feed |
| ❌ | `GET` | `/api/v1/organization/:organizationId/activity` | Org-level audit log |

> Events: `task created`, `status changed`, `assigned/unassigned`, `priority/dueDate changed`, `comment added`, `member added/removed`

### Dashboards
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `GET` | `/api/v1/organization/:organizationId/dashboard` | Org dashboard: project count, member count, task counts, completed/pending, by `status`/`priority`, recent projects/activity |
| ❌ | `GET` | `/api/v1/organization/:organizationId/projects/:projectId/dashboard` | Project dashboard: task counts, completed/in-progress/overdue, members, recent activity |

### Search & Filtering
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `GET` | `/api/v1/organization/:organizationId/search?q=&type=project\|task\|member` | Cross-entity search |
| ❌ | `GET` | `/api/v1/.../projects?status=&priority=&assignee=&project=&dateFrom=&dateTo=&sort=&page=&limit=` | Query support on tasks/projects |

### Notifications
| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ❌ | `GET` | `/api/v1/notifications` | In-app inbox |
| ❌ | `PATCH` | `/api/v1/notifications/:notificationId/read` | Mark read |
| ❌ | `POST` | `/api/v1/notifications/read-all` | Mark all read |

> Events: assignment, mention, invitation, member-change, status-change, comment

### Real-Time / WebSockets + Redis + Background Jobs + WebRTC + Chat
| Status | Area | Notes |
|--------|------|-------|
| ❌ | **WebSockets** `WS /realtime` | Task updates, comments, notifications, member changes, presence, typing, dashboard |
| ❌ | **Redis** | Caching, rate limiting (`Fixed/Sliding/Token Bucket`), `Pub/Sub`, presence, queues |
| ❌ | **Background Jobs** `BullMQ / Queue` | Email invitations, notification processing, expired-invitation cleanup, report generation |
| ❌ | **WebRTC** signaling via WebSocket | `create/join/leave` meetings, audio/video, screen sharing, participant list |
| ❌ | **Chat** `POST/GET /organization/:organizationId/channels`, `/projects/:projectId/channels`, `/dm`, messages, reactions, read status | `React → Socket.IO → Node/Express → Redis Pub/Sub → MongoDB` |

### RBAC / Permissions — Centralize
| Status | File | Notes |
|--------|------|-------|
| ⚠️ Partial | `auth-required-role.ts:6`, `auth-organization-member.ts:5`, `auth-project-member.ts:5` | Scattered role checks |
| ❌ | `src/utils/permissions.ts` | Need central matrix: `organization.read/create/update/delete`, `member.read/create/update/delete`, `project.*`, `task.*` etc. |

### Security / Audit + API + File / Media + System Admin
| Status | Area | Notes |
|--------|------|-------|
| ⚠️ Partial | Audit logs, rate limiting, tenant isolation, validation, error handling (`error-middleware.ts`), token expiration, health checks | Done partially |
| ❌ | Dedicated | Login history, failed-login tracking, refresh-token rotation, CORS/security headers test, request logging, API versioning (`/api/v2`), System Admin routes (`/admin/organizations`, `/admin/users`, suspend, analytics) |

### MongoDB / Mongoose Indexes
| Status | Index | File |
|--------|-------|------|
| ✅ | `OrganizationMember (organization_id, userId)` unique | `organization-model.ts:74` |
| ✅ | `ProjectMember (project_id, userId)` unique | `project-model.ts:65` |
| ❌ | `Project: organizationId` index, `Task: projectId` index, compound for search, soft deletion, audit data | — |

---

## Quick Next Steps — Suggested order (lowest effort → highest value)

1. ✅ **Fix PARTIAL paths** — add spec aliases (30 min): keep old routes, add new ones pointing to same controller. e.g. `router.patch("/organization/:organizationId", ...)` alongside existing `/update`.
2. ⚠️ **Fix `auth-organization-member.ts:5`** to return `403` when not member (5 lines) — critical security.
3. ❌ **Build `transfer-ownership`** (1 controller + 1 route) — unblocks `OWNER` handoff.
4. ❌ **Build `DELETE` project + project members `GET/POST/DELETE`** (3 handlers) — completes Phase 2 MVP.
5. ❌ **Extend `Task` model + build task CRUD + `task-routes.ts`** (Phase 2 MVP target: `User → Org → Project → Task` chain).
6. ❌ **Scaffold Invitations** model + routes (Phase later but high user value).

---

## File Map — Where to look

| Area | Files |
|------|-------|
| **Routes** | `src/routes/user-routes.ts:1`, `organization-routes.ts:1`, `project-routes.ts:1`, `index.ts:1` (exports) |
| **Controllers** | `src/controllers/user-auth-controller.ts:1`, `organization-controller.ts:1`, `project-controller.ts:1` |
| **Models** | `src/models/user-model.ts:1`, `organization-model.ts:1`, `project-model.ts:1`, `task-model.ts:1`, `index.ts:1` |
| **Middlewares** | `src/middlewares/auth-middleware.ts:1`, `auth-organization-member.ts:5`, `auth-required-role.ts:6`, `auth-project-member.ts:5`, `error-middleware.ts:1` |
| **Entry** | `backend/index.ts:1` (mounts routers at `/api/v1:33-35`) |
| **Docs** | `src/docs/swagger.ts:1` (OpenAPI 3.0 — currently documents PARTIAL paths — needs sync after alias) |
| **Rules audit** | `multi-tenant-platform-rules.md` + `REMAINING_TASKS_AUDIT.txt` |

---

> **Swagger:** `http://localhost:8000/api/v1/docs`
