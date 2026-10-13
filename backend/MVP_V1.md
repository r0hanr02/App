# MVP V1 Scope Plan — Multi-Tenant Developer Collaboration Platform

> **Base URL:** `/api/v1`
> **Date:** 2026-10-13 (previous: 2026-09-28 — that snapshot is superseded)
> **Spec:** `backend/multi-tenant-project-platform-features.md` (Must Have + Phases 1-2 + MVP target chain)
> **Rules:** `backend/multi-tenant-platform-rules.md` (35 rules)
> **Status sources:** `backend/REMAINING_TASKS_AUDIT.md` (re-audited 2026-10-13) + `frontend/REMAINING_TASKS_AUDIT.md` (new 2026-10-13) + live audit of `src/controllers/*` + `src/middlewares/*` + `src/routes/*` + `src/models/*`
> **V1 Goal:** `User → Organization → OrganizationMember → Project → ProjectMember → Task` works end-to-end with tenant isolation + RBAC.
> **Decision (kept):** No separate `validate-project-belongs-to-org` middleware — tenant check lives in `requireProjectAccess` + `requireTaskAccess` (per owner). Do NOT create that file; delete it if an empty copy reappears.

**Current:** 32 API routes callable (was 26 on 09-28, 14 on 09-22) + 3 system (`/`, `/health`, `/docs`). ~100% of V1 routes exist, ~90% fully correct (remaining = polish, not blockers). `npx tsc --noEmit` was clean 2026-09-30; re-run before release (updateTask/deleteTask + project-list changes postdate it).

**Changes since 09-28 (why this update was needed):**
- `PATCH /tasks/:taskId` + `DELETE /tasks/:taskId` (soft) BUILT — Tasks section was 0%, now complete.
- `POST /transfer-ownership` BUILT (was Tier 1 open) — now done with tx.
- Project members hardened + `DELETE project` + `DELETE project-member` BUILT (was 40% partial) — now done.
- `GET /projects` now MEMBER-inclusive + `?search=&page=&limit=&sort=` (was OWNER/ADMIN-only, no query) — Tier 2 item closed (minus `hasNextPage` bug, see below).
- `PATCH /projects/:projectId` now carries `requireProjectAccess` (was missing) — closed.
- `POST /tasks` fixed: assignee optional + org-membership check + 201 (was required/200) — closed.
- `GET /tasks` gained `?search=&page=&limit=` + `sort -createdAt` (was filter-only) — closed.
- Frontend audited for the first time (`frontend/REMAINING_TASKS_AUDIT.md`): backend is ahead of UI — Home/Onboarding are dummy-only, 6/12 routes still NotFound. V1 demo needs P0 wiring, not more APIs.

---

## How much is done? — Progress snapshot (2026-10-13, post-audit)

### V1 core by count (backend)

| Area | Done (callable + correct) | Partial (works but gap) | Missing for V1 | V1 Progress |
|------|---------------------------|-------------------------|----------------|-------------|
| System / Docs (`/`, `/health`, `/docs`) | 3 | 0 | 0 | 100% — done |
| Auth & User | 5 (`register,login,logout,refresh` + `PATCH /me` `user-auth-controller.ts:231` + `user-routes.ts:21`) | 1 (`GET /me` exists `user-routes.ts:20` but `authMe:177` uses refresh-cookie rotation, not Bearer `authMiddleware` — wrong semantics) | 1 (`PATCH /me/password`; `GET /users/:userId` is optional per spec, not V1) | ~85% |
| Organization CRUD | 7 (`POST /organization` tx+slug `:24`, `GET /organization`, `GET /:id`, `GET /:id/member`, `PATCH /:id` `OWNER,ADMIN`, `DELETE /:id` `OWNER`-only tx-cascade, `DELETE /:id/me` + alias `/member/me` last-OWNER guard) | 0 | 0 | 100% — done (was ~70% logic) |
| Organization Members | 4 (`POST /member` blocks `OWNER` + `ADMIN`-by-`OWNER`-only `:327`, `PATCH /member/:userId` scoped + last-OWNER guard `:400`, `DELETE /member/:userId` self-remove + last-OWNER guard `:483`, `POST /transfer-ownership` tx `:535`) | 0 | 0 | 100% logic — done |
| Project CRUD | 5 (`POST /projects` tx, `GET /projects` MEMBER-inclusive + search/page, `GET /projects/:projectId`, `PATCH /projects/:projectId` + `requireProjectAccess`, `DELETE /projects/:projectId` tx-cascade) | 1 (`GET /projects` `project-controller.ts:71`: `.limit(10)` hardcoded, `hasNextPage` compares vs `pageLimit` not `totalPages`, `sort` unsanitized) | 0 | ~95% (was ~80%) |
| Project Members | 3 (`POST .../members`, `GET .../members`, `DELETE .../members/:userId` — all tenant-safe via `requireProjectAccess`) | 0 | 0 (`PATCH .../members/:userId` correctly deferred — no project-role field yet) | 100% — done (was ~40%) |
| Tasks | 6 (`POST`, `GET` list with `?status=&priority=&type=&assignee_id=&search=&page=&limit=`, `GET /:taskId`, `PATCH /:taskId`, `DELETE /:taskId` soft, `PATCH /:taskId/assign` — all via `requireProjectAccess` + `requireTaskAccess`) | 0 | 0 | 100% — done (was 0%) |
| Dashboard basic (backend aggregate) | 0 | 0 | 2 (org + project `GET .../dashboard`) — interim: frontend `useHomeDashboard` fans out client-side | 0% API, ~60% UX-shell (dummy) |
| **V1 Total (backend)** | **~30 correct** | **~2 partial** (`GET /me` semantics, `GET /projects` pagination bugs) | **~3 small** (`PATCH /me/password`, project-model extension, dashboards API) | **~100% exist, ~90% correct** (was 75%/65%) |

### V1 frontend by count (new — see `frontend/REMAINING_TASKS_AUDIT.md`)

| Area (features :355-384) | State | Backend dep |
|---|---|---|
| Auth screens, org selector/switch, layouts, guards | Done (real API) | None — ready |
| Home dashboard shell (9 widgets) | UI done, **dummy-only** (`Home.tsx:44`) — hooks `useHomeDashboard`/`useCreateTask` exist unwired | None — wire only |
| Onboarding form shell | UI done, submit dummy (`Onboarding.tsx:11`) — `useCreateOrganization` exists unwired | None — wire only |
| Projects / Tasks / Users / Organization pages | NotFound placeholders (6/12 routes) | None — all APIs ready |
| Notifications inbox | NotFound (correct — no API yet) | Blocked (V2) |
| Search/filters/pagination/optimistic/URL-state/theme | Not wired | None — build with pages |

### What is fully done (keep)

- `authMiddleware` — Bearer verify, `req.userId` + `req.user`, `401` — done.
- `requireOrganizationMember` — `400` bad id, `404` org missing, `403` non-member — fixed, done.
- `requireProjectAccess` (renamed from `requireProjectMember`) — `400/404`, tenant `403`, `OWNER/ADMIN` bypass, `MEMBER` must be `ProjectMember` — done on all `:projectId` routes.
- `requireTaskAccess` — `{ _id, project_id, organization_id, is_deleted:false }` scope, `req.task` — done on all `:taskId` routes.
- `requireOrganizationRole` + `error-middleware.ts` (`ValidationError→400`, `CastError→400`, `11000→409`, JWT→401, Zod→400) — done.
- Org/project create + org/project delete + transfer-ownership transactions — done.
- Org member hardening (hierarchy + last-`OWNER` on add/change/remove/leave/transfer) — done.
- Spec paths everywhere (`PATCH /organization/:id`, `PATCH .../member/:userId`, `POST .../projects`, `PATCH .../projects/:projectId`, `DELETE .../member/me` alias) — done.
- Task model FULL (`task_name/description/status/priority/type/due_date/project+org/creator/assignee/is_deleted` + 6 indexes incl. text) + search/pagination/sort — done.
- Unique `OrganizationMember` + `ProjectMember` indexes + `11000→409` — done.

### What is NOT done (no longer blocks V1 demo — small items only)

1. `GET /me` semantics — `authMe:177` verifies refresh cookie + rotates tokens on GET. Fix: add Bearer variant `router.get("/me", authMiddleware, getMe)`. (Same as 09-28 item 8, still open.)
2. `PATCH /me/password` — missing (old + new, re-hash, revoke refresh). Only missing Auth item that matters.
3. `GET /projects` pagination bugs — `.limit(10)` hardcoded (ignores `pageLimit`), `hasNextPage: currentPage < pageLimit` should be `< totalPages`, unsanitized `sort`. (New — found in this audit.)
4. Project model extension — `project-model.ts:3` still `project_name + organization_id` only. Features wants `description, status, visibility, start/due, slug/key`. Plus `project_name unique:true` is global — needs compound `{ organization_id, project_name }` + `Project(organization_id)` index. (Carried from 09-28 Tier 2.)
5. Dashboards API — `GET .../dashboard` org + project aggregates missing. Interim frontend fan-out works for MVP; move to aggregation in V1.1. (Carried, deprioritized correctly.)
6. Response shape + swagger sync — org/project/task `{ message, data }` vs auth `{ success, ... }`; `swagger.ts` still names old middleware / may lack update/delete task docs. Standardize (recommend `{ success, message, data }`).
7. Housekeeping — remove `console.log(organization)` in frontend `RouteFactory.tsx:58`; commit/stash 4 dirty files on `dashboard-implementation`; re-run `tsc --noEmit`.

> Rule: V1 backend is done when P0-1..P0-5 below pass + `tsc --noEmit` clean. V1 demo (UI) is done when frontend P0 wiring lands (Home + Onboarding real data).

---

## Tier 0 — Blockers (all closed — keep as regression checklist)

- [x] **Fix `requireOrganizationMember` to enforce 403** — done.
- [x] **Tenant isolation without separate middleware** — done via `requireProjectAccess` + `requireTaskAccess`. Do NOT create a separate validator file.
- [x] **Fix path mismatches** — done (all spec paths + `DELETE .../member/me` alias).
- [x] **Fix role bugs** — done (org update `OWNER,ADMIN`; delete `OWNER`; member hierarchy; project list MEMBER-inclusive).
- [x] **Fix `deleteOrganization` cascade + `leaveOrganization` last-OWNER** — done (tx cascade + ProjectMember cleanup).
- [x] **Transfer-ownership** — done (tx `target→OWNER`, `requester→ADMIN`).
- [x] **Project members harden + delete project/member** — done (tenant checks, org-membership proof, `409`, `201`).
- [x] **Task CRUD complete** — done (create/list/details/assign/update/soft-delete + search/page/sort; assignee optional + `201`).

## Tier 1 — Missing MVP Core (only 2 items left; rest closed)

- [x] ~~`PATCH /me`~~ — done. [ ] **`GET /me` Bearer fix** + [ ] **`PATCH /me/password`** ← OPEN (P0-1, P0-2).
- [x] ~~`transfer-ownership`~~ — done.
- [x] ~~Project members + delete project~~ — done.
- [x] ~~Task CRUD~~ — done (model extended, all 6 routes, inline tenant checks per owner decision).

## Tier 2 — Minimal Usability for V1 (mostly closed)

- [x] Transactions (`createOrganization` + `createProject` + `deleteOrganization` + `deleteProject` + `transfer`) — done.
- [x] `ObjectId` validation + codes (`400/403/404/409`) + `201` creates — done.
- [x] `GET /projects?search=&page=&limit=&sort=` + `GET /tasks?search=&page=&limit=&sort=` — done (modulo P0-3 pagination bugs).
- [ ] Extend `Project` model: `description, status, visibility, start/due, slug/key` + compound unique + index ← OPEN (P0-5).
- [ ] Basic dashboards API (counts only): `GET .../dashboard` org + project ← OPEN but V1.1 (frontend fan-out covers demo).
- [ ] Centralize `utils/permissions.ts` matrix ← OPEN, optional for V1 (checks work scattered).

---

## Explicitly OUT of V1 (defer to V1.1 / V2 — unchanged, matches features Phases 4-8)

- Invitations full flow (model + 5 routes), Task Comments, Attachments (S3), Activity/Audit full, cross-entity Search, Notifications (+ inbox UI), WS/Redis/BullMQ/Jobs/WebRTC/Chat, File/Media, System Admin (`/admin/*`), `/api/v2`.
- Frontend: Notifications page beyond empty-state, drag-and-drop board, advanced analytics, testing suites, Docker/CI.

---

## V1 Acceptance (updated — backend 1-7 green, 8 tracks docs; frontend 9-10 are the demo gate)

1. `POST /register` → `POST /login` → `GET /me` works. (Backend: use `PATCH /me` + cookie `GET /me` today; Bearer `GET /me` = P0-1.)
2. `POST /organization` → creator `OWNER` → `GET /organization` lists it. ✅
3. `POST .../member` → `GET .../member` shows them, non-member `403`. ✅
4. `POST .../projects` → `GET .../projects/:projectId` tenant-isolated (`403` cross-org). ✅
5. `POST .../members` rejects non-org user `400`, duplicate `409`; `GET .../members` populated. ✅
6. `POST .../tasks` → `assign` → `PATCH .../tasks/:taskId` status flow → `DELETE` soft-deletes (`is_deleted`, hidden from list). ✅
7. `transfer-ownership` hands off, last `OWNER` cannot leave/be removed/demoted. ✅
8. Swagger `/api/v1/docs` matches spec paths. (Needs P0-6 sync for update/delete task + rename.)
9. **[Frontend gate]** Home dashboard renders REAL org data (not `DUMMY_*`) via `useHomeDashboard`; create-task modal posts via `useCreateTask`. ← OPEN (F-P0-1).
10. **[Frontend gate]** Onboarding creates org via `useCreateOrganization` and lands on Home. ← OPEN (F-P0-2).

## Suggested Order (updated — backend-first is done; frontend is the critical path)

1. Backend P0 (half-day each): Bearer `GET /me` + `PATCH /me/password` + `getAllProject` pagination fix + swagger/shape sync.
2. Frontend P0 (1–2 days): wire Home (`useHomeDashboard`/`useCreateTask`) + Onboarding (`useCreateOrganization`) + fix create-org navigation + remove `console.log`.
3. Frontend P1 (1–2 weeks): `PROJECTS` → `TASKS` → `USERS` → `ORGANIZATION` pages (all APIs ready — reuse Table/SearchField/Modal/panels).
4. Backend P0-5 + V1.1: project-model extension (+ filters) → invitations → dashboards API → comments/activity → `permissions.ts`.
5. V2 per features phases: Redis → WS → jobs → WebRTC → chat → files → admin → testing → Docker/CI.
