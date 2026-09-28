# MVP V1 Scope Plan — Multi-Tenant Developer Collaboration Platform

> **Base URL:** `/api/v1`
> **Date:** 2026-09-28 (updated after full controller + middleware audit)
> **Spec:** `backend/multi-tenant-project-platform-features.md`
> **Status source:** `backend/ROUTES_STATUS.md` + `backend/REMAINING_TASKS_AUDIT.txt` + live audit of `src/controllers/*` + `src/middlewares/*` + `src/routes/*`
> **V1 Goal:** `User → Organization → OrganizationMember → Project → ProjectMember → Task` works end-to-end with tenant isolation + RBAC.
> **Decision:** No separate `validate-project-belongs-to-org` middleware — tenant check lives in `requireProjectAccess` + controllers (per owner). Empty `validate-project-belongs-to-org.ts` should be deleted.

**Current:** ~26 API routes callable (was 14). ~85% of non-task V1 exist, ~80% correct. `npx tsc --noEmit` passes (2026-09-28).

---

## How much is done? — Progress snapshot (2026-09-28, post-audit)

### V1 core by count

| Area | Done (callable + correct) | Partial (works but gap) | Missing for V1 | V1 Progress |
|------|---------------------------|-------------------------|----------------|-------------|
| System / Docs (`/`, `/health`, `/docs`) | 3 | 0 | 0 | 100% — done |
| Auth & User | 4 (`register,login,logout,refresh` in `user-auth-controller.ts:16,58,105,141`) + `PATCH /me` (`updateMe.ts:211` + `user-routes.ts:21`) | 1 (`GET /me` exists `user-routes.ts:20` but `authMe.ts:165` uses refresh-cookie rotation, not Bearer `authMiddleware` — wrong semantics) | 2 (`PATCH /me/password`, `GET /users/:userId` optional) | ~70% |
| Organization CRUD | 5 (`POST /organization` with-tx+slug `organization-controller.ts:16`, `GET /organization`, `GET /:id`, `GET /:id/member`, `PATCH /:id` `OWNER,ADMIN`) | 2 (`DELETE /:id/me` should be `/member/me` per spec `organization-routes.ts:41-46`; `DELETE /:id` role fixed to `OWNER` only but cascade incomplete) | 1 (`transfer-ownership`) | ~80% paths, ~70% logic |
| Organization Members | 3 (`POST /member` blocks `OWNER`+`ADMIN`-by-`OWNER`-only `organization-controller.ts:260,268`, `PATCH /member/:userId` scoped+last-OWNER guard `:304`, `DELETE /member/:userId` self-remove+last-OWNER guard `:387`) | 0 | 0 | 100% logic — done |
| Project CRUD | 4 (`POST /projects` with-tx `project-controller.ts:9`, `GET /projects`, `GET /projects/:projectId` with `requireProjectAccess` bypass, `PATCH /projects/:projectId` all with tenant check `:106,157`) | 1 (`GET /projects` still `OWNER,ADMIN` only `project-routes.ts:25` — blocks `MEMBER`; no `?search=&status=&page=`) | 1 (`DELETE .../projects/:projectId`) | ~80% |
| Project Members | 0 | 2 (`POST .../members` + `GET .../members` exist `project-routes.ts:53,62` + `project-controller.ts:176,215` but incomplete — see bugs) | 1 (`DELETE .../members/:userId`) | ~40% — partial |
| Tasks | 0 (model orphaned `task-model.ts:1`) | 0 | 6 (`POST/GET` list, `GET/PATCH/DELETE /:taskId`, `PATCH /:taskId/assign`) + model extension | 0% |
| Dashboard basic | 0 | 0 | 2 (org + project) | 0% |
| **V1 Total** | **~16 correct** | **~6 partial** | **~13 to build** | **~75% exist, ~65% correct** |

### What is fully done (keep)

- `authMiddleware` (`auth-middleware.ts:15`) — Bearer verify, `req.userId` + `req.user`, `401` — done.
- `requireOrganizationMember` (`auth-organization-member.ts:7`) — `400` bad id, `404` org missing, `403` non-member — fixed, done.
- `requireProjectAccess` (`auth-project-member.ts:7`, renamed from `requireProjectMember`) — `400/404`, tenant `403` (`project.organization_id !== organizationId`), `OWNER/ADMIN` bypass, `MEMBER` must be `ProjectMember` — done, no separate validator file needed.
- `requireOrganizationRole` (`auth-required-role.ts:7`) + `error-middleware.ts:29` (`ValidationError→400`, `CastError→400`, `11000→409`, JWT→401, Zod→400) — done.
- Org create with tx + slug auto-gen (`organization-controller.ts:23-56`), project create with tx (`project-controller.ts:38-62`) — done.
- Org member hardening: `addMember`, `changeMemberRole`, `removeMember` all enforce hierarchy + last-`OWNER` — done.
- Routes fixed to spec: `PATCH /organization/:id` (was `/update`), `PATCH .../member/:userId` (was `/change-role`), `POST .../projects` plural, `PATCH .../projects/:projectId` (was `/update`), `DELETE org` → `OWNER` only — done.
- Indexes unique `OrganizationMember` + `ProjectMember` — done.

### What is NOT done (blocks V1) — verified in code

1. `DELETE /organization/:organizationId/me` path mismatch — spec is `DELETE .../member/me`, code is `.../:id/me` (`organization-routes.ts:41`). Rename or alias.
2. `leaveOrganization` (`organization-controller.ts:129`) — has `400/404` but **no last-`OWNER` guard**. Last owner can leave → 0-owner org.
3. `deleteOrganization` (`organization-controller.ts:156`) — `startSession` but **no `startTransaction()`**, deletes only `Org + OrgMembers`, **no cascade** `Projects → ProjectMembers → Tasks`. Needs full tx cascade.
4. `addMemberInProject` (`project-controller.ts:176`) — missing: `project.organization_id === organizationId` check, target `User.exists`, target `OrganizationMember` check (must be org member), `11000 → 409`, returns `200` should be `201`. Has `console.log` debug `:189` to remove.
5. `getAllMemberInProject` (`project-controller.ts:215`) — missing: `Project.findById` + tenant check + `404` if project missing. Currently lists by `project_id` only.
6. `GET /projects` + `GET .../members` block `MEMBER` (`project-routes.ts:25,62` require `OWNER,ADMIN`). `MEMBER` project-member cannot list. Relax or add bypass like `GET /:projectId`.
7. `POST .../members` stacks `requireProjectAccess` (`project-routes.ts:58`) — requester must already be project member (or `OWNER/ADMIN` bypass). OK for `OWNER/ADMIN`, but document intent; non-member `ADMIN` passes via bypass, good.
8. `GET /me` semantics — `authMe.ts:165` verifies refresh cookie + rotates tokens. Spec `/me` should be `authMiddleware` (Bearer) → return user. Fix route to `router.get("/me", authMiddleware, getMe)`.
9. Missing: `PATCH /me/password`, `DELETE .../projects/:projectId`, `DELETE .../members/:userId`, `transfer-ownership`, all `Tasks`, dashboards, `permissions.ts` matrix, project search/filter.
10. Housekeeping: delete empty `middlewares/validate-project-belongs-to-org.ts` (0 lines, unused — per no-middleware decision), remove `console.log`, sync `docs/swagger.ts` (still references `requireProjectMember`, `/update`, `/change-role`).

> Rule: V1 is done when `403/cross-tenant` = 0 + `me + transfer + project members + tasks` all pass tenant isolation.

---

## Tier 0 — Blockers (fix before anything new)

- [x] **Fix `requireOrganizationMember` to enforce 403** — done `auth-organization-member.ts:34-46`.
- [x] **Tenant isolation without separate middleware** — done via `requireProjectAccess.ts:32-36` + `project-controller.ts:111,161`. Action left: delete empty `validate-project-belongs-to-org.ts`.
- [x] **Fix 5/5 PARTIAL paths** — done. Added spec alias `DELETE .../member/me` alongside `/me` (`organization-routes.ts:41-52`).
- [x] **Fix role bugs** — done for org (`OWNER` delete, `OWNER,ADMIN` update, member hierarchy). Left: relax `GET /projects` + `GET .../members` for `MEMBER` with project access.
- [x] **Fix `deleteOrganization` cascade + `leaveOrganization` last-OWNER** — done `organization-controller.ts:129,156`. `leave` blocks last `OWNER` + cleans `ProjectMember`s; `delete` uses tx with `Tasks → ProjectMembers → Projects → OrgMembers → Org` cascade.

## Tier 1 — Missing MVP Core (required for V1 demo)

- [x] **`PATCH /me`** — done `user-auth-controller.ts:211`. [ ] **`GET /me` fix** (use Bearer, not cookie) + [ ] **`PATCH /me/password`**.
- [ ] **`POST /organization/:organizationId/transfer-ownership`** — new in `organization-controller.ts` + route. `OWNER` only, target must be member, tx `target→OWNER`, `requester→ADMIN`.
- [x] **Project members harden + delete project** — done `project-controller.ts:182,227,257,296` + `project-routes.ts:53-83`.
  - [x] `GET/POST .../members` hardened (tenant check inline, org-membership required, `409` duplicate, `201` create, log removed).
  - [x] `DELETE .../projects/:projectId/members/:userId` — `OWNER/ADMIN` only, org-project tenant check, project-only removal.
  - [x] `DELETE .../projects/:projectId` — `OWNER` only, tx cascade `Tasks + ProjectMembers + Project`.
- [ ] **Task CRUD (extend orphaned model)**
  - Extend `task-model.ts:1`: `title, description, status, priority, type, dueDate, creator, assignee, organization ref, timestamps`.
  - New: `task-controller.ts` + `task-routes.ts` (no extra validator file — do `project.organization_id` + `task.project_id` checks inline in controller like projects).
  - `POST /.../projects/:projectId/tasks`, `GET` list with `?status=&priority=&assignee=&search=&page=&limit=`, `GET/PATCH/DELETE /.../tasks/:taskId`, `PATCH .../assign`.

## Tier 2 — Minimal Usability for V1

- [x] Transactions for `createOrganization` + `createProject` + `deleteOrganization` + `deleteProject` — done.
- [x] `ObjectId` validation + codes (`400/403/404/409`) + `201` creates — done via controllers + `error-middleware.ts`.
- [ ] Extend `Project` model (`project-model.ts:4`): `description, status, visibility, start/due, slug/key`.
- [ ] `GET /projects?search=&status=&page=` — upgrade `getAllProject`.
- [ ] Basic dashboards (counts only, no realtime): `GET .../dashboard` org + project.
- [ ] Centralize `utils/permissions.ts` matrix (optional for V1, do if time).

---

## Explicitly OUT of V1 (defer to V1.1 / V2)

- Invitations full flow, Task Comments, Attachments (S3), Activity/Audit full, cross-entity Search, Notifications, WS/Redis/BullMQ/Jobs/WebRTC/Chat, File/Media, System Admin (`/admin/*`), `/api/v2`.

---

## V1 Acceptance

1. `POST /register` → `POST /login` → `GET /me` (Bearer) works.
2. `POST /organization` → creator `OWNER` → `GET /organization` lists it.
3. `POST .../member` → `GET .../member` shows them, non-member `403`.
4. `POST .../projects` → `GET .../projects/:projectId` tenant-isolated (`403` cross-org).
5. `POST .../members` rejects non-org user `400`, duplicate `409`; `GET .../members` populated.
6. `POST .../tasks` → `assign` → status flow works.
7. `transfer-ownership` hands off, last `OWNER` cannot leave/be removed.
8. Swagger `/api/v1/docs` matches spec paths (update after fixes).

## Suggested Order (updated)

1. `leave` alias + last-`OWNER` + `deleteOrganization` cascade (Tier 0 close-out)
2. Harden `addMemberInProject` / `getAllMemberInProject` + add `DELETE member` + `DELETE project`
3. Fix `GET /me` + add `PATCH /me/password`
4. `transfer-ownership`
5. Task model + CRUD (inline tenant checks, no new middleware)
6. Dashboards minimal + swagger sync + delete empty validator file
