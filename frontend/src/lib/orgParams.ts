/**
 * Org param helpers.
 *
 * Same routing, org-aware params:
 * - Routes keep their existing paths ("/", "/projects", ...).
 * - Active org travels as a search param: `?orgId=<organization_id>`.
 * - Backend paths are built as `/organization/:organizationId/...`.
 */

export const ORG_SEARCH_KEY = "orgId" as const;

export type OrgSearch = {
  orgId?: string;
};

export function getOrgIdFromSearch(search: unknown): string | null {
  if (!search || typeof search !== "object") return null;
  const orgId = (search as Record<string, unknown>)[ORG_SEARCH_KEY];
  return typeof orgId === "string" && orgId.length > 0 ? orgId : null;
}

export function withOrgSearch(
  orgId: string | null | undefined,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...extra,
    ...(orgId ? { [ORG_SEARCH_KEY]: orgId } : {}),
  };
}

/** Backend path for org-scoped resources. e.g. orgProjectsPath(id) => `/organization/:id/projects` */
export function orgBasePath(orgId: string): string {
  return `/organization/${orgId}`;
}

export function orgProjectsPath(orgId: string): string {
  return `${orgBasePath(orgId)}/projects`;
}

export function orgProjectPath(orgId: string, projectId: string): string {
  return `${orgProjectsPath(orgId)}/${projectId}`;
}

export function orgTasksPath(orgId: string, projectId: string): string {
  return `${orgProjectPath(orgId, projectId)}/tasks`;
}

export function orgTaskPath(
  orgId: string,
  projectId: string,
  taskId: string,
): string {
  return `${orgTasksPath(orgId, projectId)}/${taskId}`;
}
