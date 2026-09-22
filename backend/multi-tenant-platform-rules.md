# Multi-Tenant Project Management Platform — Rules

## 1. Core Architecture

- **User**
  - Represents an authenticated person.
- **Organization**
  - Represents a tenant.
- **OrganizationMember**
  - Represents a user's membership in an organization.
  - Stores the user's organization-level role.
- **Project**
  - Belongs to exactly one organization.
- **ProjectMember**
  - Represents a user's assignment/access to a specific project.
- **Task**
  - Belongs to exactly one project.

### Relationship

```text
User
  ↓
OrganizationMember
  ↓
Organization
  ↓
Project
  ↓
ProjectMember
  ↓
Task
```

---

## 2. Authentication Rules

- User must be authenticated before:
  - Creating an organization.
  - Accessing protected organization data.
  - Creating/updating/deleting projects.
  - Managing organization members.
  - Managing project members.
  - Managing tasks.
- `authMiddleware` determines the current user.
- Use `req.user.id` for the authenticated user's identity.
- Do not accept the authenticated user's `userId` from the request body for ownership/membership decisions.

---

## 3. Organization Creation

### Route

- `POST /organization`

### Rules

- User must be authenticated.
- `organization_name` is required.
- `slug` can be generated/provided according to the application's slug strategy.
- The user who creates the organization automatically becomes:
  - `OWNER`
- Creating an organization should create:
  - One `Organization`
  - One `OrganizationMember` with `role = OWNER`
- These two database writes should eventually be handled with a transaction.

---

## 4. Organization Roles

### Roles

- `OWNER`
- `ADMIN`
- `MEMBER`

### Role responsibilities

| Operation | OWNER | ADMIN | MEMBER |
|---|---:|---:|---:|
| View organization | Yes | Yes | Yes |
| Update organization | Yes | Yes | No |
| Delete organization | Yes | No | No |
| View members | Yes | Yes | Yes |
| Add member | Yes | Yes | No |
| Remove member | Yes | Yes | No |
| Change member role | Yes | No | No |
| Add ADMIN | Yes | No | No |
| Add OWNER | Separate ownership operation | No | No |

---

## 5. Organization Access

### Route

- `GET /organization/:organizationId`

### Rules

- Authenticate the user.
- Verify that the organization exists.
- Verify that the authenticated user belongs to the organization.
- If the user is not a member:
  - Return `403 Forbidden`.
- If the organization does not exist:
  - Return `404 Not Found`.

### Middleware responsibility

- `authMiddleware`
  - Identifies the user.
- `requireOrganizationMember`
  - Verifies membership.
- `requireOrganizationRole`
  - Verifies organization-level permissions.

---

## 6. Get User's Organizations

### Route

- `GET /organization`

### Rules

- Authenticate the user.
- Use `req.user.id`.
- Find the user's `OrganizationMember` records.
- Get the corresponding organizations.
- Do not accept another user's ID from the client.

---

## 7. Organization Update

### Route

- `PATCH /organization/:organizationId`

### Allowed fields

- `organization_name`
- `slug`

### Rules

- User must belong to the organization.
- OWNER and ADMIN can update organization information.
- MEMBER cannot update organization information.
- Do not allow this endpoint to modify:
  - Members
  - Roles
  - Owner
  - `organization_id`
  - `createdAt`

---

## 8. Organization Deletion

### Route

- `DELETE /organization/:organizationId`

### Rules

- User must belong to the organization.
- Only OWNER can delete the organization.
- Deletion must account for related:
  - OrganizationMember records
  - Projects
  - ProjectMember records
  - Tasks
- Decide whether to use cascading deletion or another cleanup strategy.

---

## 9. Organization Members

### Get members

- `GET /organization/:organizationId/member`

### Rules

- User must belong to the organization.
- Return the organization's `OrganizationMember` records.
- Populate required user information such as:
  - Name
  - Email
- Do not expose unnecessary sensitive user information.

### Add member

- `POST /organization/:organizationId/member`

### Rules

- User must belong to the organization.
- Only OWNER and ADMIN can add members.
- Target user must exist.
- Target user should not already belong to the organization.
- Target user should normally be added as:
  - `MEMBER`
  - or `ADMIN` when allowed by the role rules.
- Only OWNER should be allowed to assign ADMIN.
- Ownership should be handled through a separate ownership-transfer operation.

### Remove member

- `DELETE /organization/:organizationId/member/:userId`

### Rules

- User must belong to the organization.
- Only OWNER and ADMIN can remove members.
- Do not allow removal of the last OWNER.
- Consider preventing users from removing themselves through this endpoint.
- Use a separate leave-organization operation for self-removal.

### Change member role

- `PATCH /organization/:organizationId/member/:userId`

### Rules

- Only OWNER can change organization member roles.
- Validate the new role.
- Do not allow arbitrary OWNER assignment through a normal role-update endpoint.
- Ownership transfer should be a separate operation.

---

## 10. Leave Organization

### Route

- `DELETE /organization/:organizationId/member/me`

### Rules

- User must be authenticated.
- User must belong to the organization.
- Use `req.user.id`.
- User can leave the organization.
- Last OWNER cannot leave without transferring ownership first.

---

## 11. Ownership Transfer

### Route

- `POST /organization/:organizationId/transfer-ownership`

### Rules

- Current user must be OWNER.
- Target user must already belong to the organization.
- Target user becomes OWNER.
- Current OWNER should become ADMIN or another predefined role.
- Do not handle ownership transfer through ordinary member creation.

---

# Project Rules

## 12. Project Relationship

- Every project belongs to exactly one organization.
- `Project.organization_id` is required.
- A project must never belong to multiple organizations.

```text
Organization
    ↓
Project
```

---

## 13. Create Project

### Route

- `POST /organization/:organizationId/projects`

### Request body

- `project_name`

### Information derived by backend

- `organizationId`
  - From route parameters.
- Creator's `userId`
  - From `req.user.id`.

### Rules

- User must be authenticated.
- User must belong to the organization.
- Project must be created under the specified organization.
- OWNER and ADMIN can create projects.
- MEMBER cannot create projects if using the current organization-level permission model.
- The creator should automatically become a `ProjectMember`.

---

## 14. Project Access / Tenant Isolation

Whenever both `organizationId` and `projectId` are supplied:

- Verify the project exists.
- Verify:

```text
project.organization_id === organizationId
```

- Never trust `projectId` alone when the request contains an organization context.
- Prevent users from accessing a project belonging to another organization.

### Example

```text
Organization A
  └── Project A

Organization B
  └── Project B
```

A request using:

```text
/organization/A/projects/B
```

must be rejected.

---

## 15. Get Project

### Route

- `GET /organization/:organizationId/projects/:projectId`

### Rules

- User must be authenticated.
- User must belong to the organization.
- Project must belong to the organization.
- Decide whether project access requires:
  - Project membership
  - Or organization-level access for OWNER/ADMIN.
- Apply the same project-access rule consistently throughout the application.

---

## 16. Update Project

### Route

- `PATCH /organization/:organizationId/projects/:projectId`

### Current editable information

- `project_name`

### Future editable information

- Description
- Status
- Visibility
- Start date
- Due date
- Other project-specific fields

### Rules

- User must belong to the organization.
- Project must belong to the organization.
- OWNER and ADMIN can update the project under the current authorization model.
- MEMBER cannot update the project unless a future project-level permission system allows it.

---

## 17. Delete Project

### Route

- `DELETE /organization/:organizationId/projects/:projectId`

### Rules

- User must belong to the organization.
- Project must belong to the organization.
- OWNER can delete the project.
- ADMIN/MEMBER cannot delete the project under the initial rules.
- Deletion must account for:
  - ProjectMember records
  - Tasks
  - Other project-related data.

---

# Project Member Rules

## 18. ProjectMember Meaning

- `OrganizationMember` answers:
  - "Does this user belong to this organization?"
- `ProjectMember` answers:
  - "Is this user assigned/accessing this project?"

Example:

```text
Organization
├── Rohan
├── Amit
├── Jay
└── Priya

Project A
├── Rohan
└── Jay
```

- Amit and Priya are organization members.
- Rohan and Jay are project members.

---

## 19. Get Project Members

### Route

- `GET /organization/:organizationId/projects/:projectId/members`

### Rules

- User must have access to the organization.
- Project must belong to the organization.
- Return the project's ProjectMember records.
- Populate required user information.

---

## 20. Add Project Member

### Route

- `POST /organization/:organizationId/projects/:projectId/members`

### Rules

- User must belong to the organization.
- Project must belong to the organization.
- Target user must exist.
- Target user must belong to the same organization.
- Target user must not already be a ProjectMember.
- Initially, OWNER and ADMIN can add project members.
- MEMBER cannot add project members under the initial rules.

---

## 21. Remove Project Member

### Route

- `DELETE /organization/:organizationId/projects/:projectId/members/:userId`

### Rules

- User must belong to the organization.
- Project must belong to the organization.
- Target user must actually be a ProjectMember.
- OWNER and ADMIN can remove project members.
- Removing a ProjectMember does not remove the user from the organization.

---

## 22. Update Project Member

### Route

- `PATCH /organization/:organizationId/projects/:projectId/members/:userId`

### Current status

- Not required if `ProjectMember` only contains:
  - `project_id`
  - `user_id`

### Add this later if needed

- Project-level role
- Assignment status
- Other project-specific membership metadata

---

# Task Rules

## 23. Task Relationship

- Every task belongs to exactly one project.
- `Task.project_id` is required.

```text
Organization
    ↓
Project
    ↓
Task
```

---

## 24. Create Task

### Route

- `POST /organization/:organizationId/projects/:projectId/tasks`

### Rules

- User must be authenticated.
- User must belong to the organization.
- Project must belong to the organization.
- User must have access to the project.
- Decide whether:
  - Project members can create tasks
  - Or only OWNER/ADMIN can create tasks.

---

## 25. Task Access

To access a task:

- Task must exist.
- Task must belong to the requested project.
- Project must belong to the requested organization.
- User must have access to the organization/project.

```text
Organization
    ↓
Project
    ↓
Task
```

Every level should be validated.

---

# Middleware Responsibilities

## 26. `authMiddleware`

- Answers:
  - "Who is the user?"
- Validates authentication.
- Sets:
  - `req.user`

---

## 27. `requireOrganizationMember`

- Answers:
  - "Does this user belong to this organization?"
- Uses:
  - `req.user.id`
  - `req.params.organizationId`
- Finds the corresponding `OrganizationMember`.
- Can attach the membership to the request for later middleware.

---

## 28. `requireOrganizationRole`

- Answers:
  - "Does this organization member have the required role?"
- Uses the role from `OrganizationMember`.
- Does not rely on `req.user.role` because a user can have different roles in different organizations.

Example:

```text
Rohan
├── Organization A → OWNER
└── Organization B → MEMBER
```

---

## 29. `requireProjectMember`

- Answers:
  - "Does this user belong to this project?"
- Uses:
  - `req.user.id`
  - `req.params.projectId`
- Should also ensure the project belongs to the requested organization when used in a tenant-scoped route.

---

## 30. Project Relationship Validation

- Verify:
  - Project exists.
  - Project belongs to `organizationId`.
- This is separate from checking whether the current user is a ProjectMember.
- Do not confuse:
  - "Does the project belong to this organization?"
  - "Does the user belong to this project?"

---

# General Security / Data Rules

## 31. Never trust client-provided identity

- Do not accept the current user's ID from the request body when it can be obtained from authentication.
- Use:
  - `req.user.id`

---

## 32. Validate ObjectIds

Validate:

- `organizationId`
- `projectId`
- `userId`
- `taskId`

before querying MongoDB.

---

## 33. Validate relationships

Always validate relationships such as:

```text
Project.organization_id
```

against:

```text
organizationId from route
```

And:

```text
ProjectMember.user_id
```

against:

```text
OrganizationMember
```

---

## 34. Prevent duplicate memberships

Use a unique compound index for:

```text
OrganizationMember
(organization_id, user_id)
```

And:

```text
ProjectMember
(project_id, user_id)
```

This prevents duplicate memberships at the database level.

---

## 35. Separate Authentication, Authorization and Business Logic

```text
Authentication
    ↓
Who is the user?

Authorization
    ↓
Can this user perform the action?

Business logic
    ↓
Perform the operation
```

Do not mix all three responsibilities into one controller.

---

# Recommended Middleware Flow

## Organization operation

```text
Request
  ↓
authMiddleware
  ↓
requireOrganizationMember
  ↓
requireOrganizationRole
  ↓
Controller
```

## Project operation

```text
Request
  ↓
authMiddleware
  ↓
requireOrganizationMember
  ↓
Validate project belongs to organization
  ↓
Project access / role check
  ↓
Controller
```

## Task operation

```text
Request
  ↓
authMiddleware
  ↓
Organization membership
  ↓
Project belongs to organization
  ↓
Project access
  ↓
Task belongs to project
  ↓
Controller
```

---

# Current Route Checklist

## Organization

- `POST /organization`
- `GET /organization`
- `GET /organization/:organizationId`
- `PATCH /organization/:organizationId`
- `DELETE /organization/:organizationId`

## Organization Members

- `GET /organization/:organizationId/member`
- `POST /organization/:organizationId/member`
- `PATCH /organization/:organizationId/member/:userId`
- `DELETE /organization/:organizationId/member/:userId`
- `DELETE /organization/:organizationId/member/me`

## Project

- `POST /organization/:organizationId/projects`
- `GET /organization/:organizationId/projects`
- `GET /organization/:organizationId/projects/:projectId`
- `PATCH /organization/:organizationId/projects/:projectId`
- `DELETE /organization/:organizationId/projects/:projectId`

## Project Members

- `GET /organization/:organizationId/projects/:projectId/members`
- `POST /organization/:organizationId/projects/:projectId/members`
- `DELETE /organization/:organizationId/projects/:projectId/members/:userId`
- `PATCH /organization/:organizationId/projects/:projectId/members/:userId` — only when project-level membership data requires updates.

## Later

- Ownership transfer
- Invitations
- Tasks
- Task assignment
- Project-level roles/permissions
