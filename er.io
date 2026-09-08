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
    project_id FK
    user_id FK
    createdAt string 
}
Task{
    id string PK
    task_name string
    createdAt string 
    project_id string FK
}
