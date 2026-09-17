User{
    id string PK
    name string 
    email string 
    password  string 
    phone string 
    dob string 
    createdAt string 
}
Organization{
    id string PK
    org_name string 
    createdAt string 
}
OrganizationMember{
    id string PK
    organization_id FK
    user_id FK
    role string
    createdAt string 
}
Project{
    id string PK
    project_name string
    organization_id FK
    createdAt string 
}
projectMember{
    id string PK
    organization_member_id FK
    project_id FK  
    createdAt string 
}
Task{
    id string PK
    task_name string
    createdAt string 
    project_id string FK
}

--Note

--role
OWNER
ADMIN
MEMBER

User:
- Email must be unique.
- Name cannot be empty.
- ID must be unique.
- Email cannot be empty.
- Password cannot be empty.
- Password should never be stored as plain text.
- createdAt should be automatically generated.  
- Phone should be unique if you use it for identification/login.

Organization:
An organization must always have at least one OWNER.
- Organization name cannot be empty.
- Every organization must have at least one owner.
- createdAt should be automatically generated.
- Organization.slug must be unique

OrganizationMember:
- A user cannot join the same organization twice.
- user_id must reference an existing user.
- organization_id must reference an existing organization.
- role cannot be empty.
- role must be a valid role.

Task
- task_name cannot be empty.
- project_id is required.
- project_id must reference an existing project.
- Every task belongs to exactly one project.
- createdAt should be automatically generated.

Project:
- Every project must belong to one organization.
- project_name cannot be empty.
- organization_id is required.
- organization_id must reference an existing organization.
- createdAt should be automatically generated.

ProjectMember:
- A user cannot join the same project twice.
- project_id must reference an existing project.
- user_id must reference an existing user.


