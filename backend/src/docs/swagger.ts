import swaggerJsdoc from "swagger-jsdoc";

const orgIdParam = {
  name: "organizationId",
  in: "path",
  required: true,
  schema: { type: "string" },
  description: "Organization ObjectId",
  example: "68c123456789abcdef123456",
};

const projectIdParam = {
  name: "projectId",
  in: "path",
  required: true,
  schema: { type: "string" },
  description: "Project ObjectId",
};

const taskIdParam = {
  name: "taskId",
  in: "path",
  required: true,
  schema: { type: "string" },
  description: "Task ObjectId",
};

const userIdParam = {
  name: "userId",
  in: "path",
  required: true,
  schema: { type: "string" },
  description: "User ObjectId",
};

const bearer = [{ bearerAuth: [] }];

const errorRef = (description: string) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
});

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Multi-Tenant Collaboration Platform API",
      version: "1.0.0",
      description:
        "Auth, Organizations, Projects and Tasks. Auth uses a Bearer access token plus an HTTP-only `refreshToken` cookie (path `/api/v1/auth`). Org/Project/Task responses use `{ message, data }`; Auth responses use `{ success, message, ... }`.",
    },
    servers: [
      { url: "http://localhost:8000", description: "Local server" },
      { url: "http://10.10.10.21:8000", description: "Development server" },
    ],
    tags: [
      { name: "Auth", description: "Register, login, logout, refresh, session" },
      { name: "User", description: "Current user profile" },
      { name: "Organization", description: "Organizations and members" },
      { name: "Project", description: "Projects and project members" },
      { name: "Task", description: "Tasks" },
      { name: "Health", description: "Service health" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "refreshToken",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          required: ["success", "message"],
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            currentPage: { type: "integer", example: 1 },
            pageLimit: { type: "integer", example: 10 },
            totalRecords: { type: "integer", example: 25 },
            totalPages: { type: "integer", example: 3 },
            hasNextPage: { type: "boolean", example: true },
            hasPreviousPage: { type: "boolean", example: false },
          },
        },
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "68c123456789abcdef123456" },
            name: { type: "string", example: "Rohan" },
            email: { type: "string", format: "email", example: "rohan@example.com" },
            phone: { type: "string", example: "9876543210" },
            dateOfBirth: { type: "string", example: "2000-01-15" },
            occupation: { type: "string", example: "Senior software engineer" },
            profilepic: { type: "string", example: "uploads/profile-123.jpg" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "string", example: "68c123456789abcdef123456" },
            name: { type: "string", example: "Rohan" },
            email: { type: "string", format: "email", example: "rohan@example.com" },
            phone: { type: "string", example: "9876543210" },
            dateOfBirth: { type: "string", example: "2000-01-15" },
            occupation: { type: "string", example: "Senior software engineer" },
            profilepic: { type: "string", example: "uploads/profile-123.jpg" },
          },
        },
        AuthUserSummary: {
          type: "object",
          description: "Subset returned by POST /auth/register",
          properties: {
            id: { type: "string", example: "68c123456789abcdef123456" },
            name: { type: "string", example: "Rohan" },
            email: { type: "string", format: "email", example: "rohan@example.com" },
            occupation: { type: "string", example: "Senior software engineer" },
            profilepic: { type: "string", example: "uploads/profile-123.jpg" },
          },
        },
        Organization: {
          type: "object",
          properties: {
            _id: { type: "string", example: "68c123456789abcdef123456" },
            organization_name: { type: "string", example: "My Company" },
            slug: { type: "string", example: "my_company" },
            organization_description: { type: "string", example: "Team workspace" },
            organization_logo: { type: "string", example: "uploads/logo-123.png" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        OrganizationMember: {
          type: "object",
          properties: {
            _id: { type: "string" },
            organization_id: { type: "string" },
            user_id: { type: "string" },
            role: { type: "string", enum: ["OWNER", "ADMIN", "MEMBER"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        OrganizationMemberPopulated: {
          type: "object",
          description: "Member row with `user_id` populated (GET /organization/{organizationId}/member)",
          properties: {
            _id: { type: "string" },
            organization_id: { type: "string" },
            user_id: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
              },
            },
            role: { type: "string", enum: ["OWNER", "ADMIN", "MEMBER"] },
          },
        },
        OrganizationMembershipPopulated: {
          type: "object",
          description:
            "Membership row with `organization_id` populated (GET /organization)",
          properties: {
            _id: { type: "string" },
            organization_id: { $ref: "#/components/schemas/Organization" },
            user_id: { type: "string" },
            role: { type: "string", enum: ["OWNER", "ADMIN", "MEMBER"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Project: {
          type: "object",
          properties: {
            _id: { type: "string" },
            project_name: { type: "string", example: "Website Revamp" },
            project_description: { type: "string", example: "Rebuild the marketing site" },
            organization_id: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ProjectMember: {
          type: "object",
          properties: {
            _id: { type: "string" },
            project_id: { type: "string" },
            user_id: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ProjectMemberPopulated: {
          type: "object",
          description:
            "Project member row with `user_id` populated (GET .../members)",
          properties: {
            _id: { type: "string" },
            project_id: { type: "string" },
            user_id: {
              type: "object",
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            _id: { type: "string" },
            task_name: { type: "string", example: "Fix login bug" },
            description: { type: "string", example: "Login fails on expired token" },
            status: {
              type: "string",
              enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"],
            },
            priority: {
              type: "string",
              enum: ["Low", "Medium", "High", "Critical"],
            },
            type: {
              type: "string",
              enum: ["Feature", "Bug", "Improvement", "Task", "Documentation"],
            },
            due_date: { type: "string", format: "date-time", nullable: true },
            project_id: { type: "string" },
            organization_id: { type: "string" },
            creator_id: { type: "string" },
            assignee_id: { type: "string", nullable: true },
            is_deleted: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TaskPopulated: {
          type: "object",
          description:
            "Task with `assignee_id` and `creator_id` populated with `name`",
          properties: {
            _id: { type: "string" },
            task_name: { type: "string", example: "Fix login bug" },
            description: { type: "string", example: "Login fails on expired token" },
            status: {
              type: "string",
              enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"],
            },
            priority: {
              type: "string",
              enum: ["Low", "Medium", "High", "Critical"],
            },
            type: {
              type: "string",
              enum: ["Feature", "Bug", "Improvement", "Task", "Documentation"],
            },
            due_date: { type: "string", format: "date-time", nullable: true },
            project_id: { type: "string" },
            organization_id: { type: "string" },
            creator_id: {
              type: "object",
              nullable: true,
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
              },
            },
            assignee_id: {
              type: "object",
              nullable: true,
              properties: {
                _id: { type: "string" },
                name: { type: "string" },
              },
            },
            is_deleted: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    paths: {
      // ---------------- Auth ----------------
      "/api/v1/auth/register": {
        post: {
          summary: "Register a new user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string", example: "Rohan" },
                    email: { type: "string", format: "email", example: "rohan@example.com" },
                    password: { type: "string", format: "password", example: "Password123" },
                    phone: { type: "string", example: "9876543210" },
                    dateOfBirth: { type: "string", example: "2000-01-15" },
                    occupation: { type: "string", example: "Senior software engineer" },
                    profilepic: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "User created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "User Created Successfully" },
                      data: { $ref: "#/components/schemas/AuthUserSummary" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            409: errorRef("Conflict — user already exists"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/auth/login": {
        post: {
          summary: "Login",
          description: "Sets an httpOnly `refreshToken` cookie (path `/api/v1/auth`).",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email", example: "rohan@example.com" },
                    password: { type: "string", format: "password", example: "Password123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Logged in. Sets HTTP-only `refreshToken` cookie.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Logged in successfully" },
                      accessToken: { type: "string" },
                      user: { $ref: "#/components/schemas/AuthUser" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            404: errorRef("User not found"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/auth/logout": {
        post: {
          summary: "Logout (clears refresh cookie)",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Logged out",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Logged out successfully" },
                    },
                  },
                },
              },
            },
            404: errorRef("No refresh token found"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/auth/refresh": {
        post: {
          summary: "Refresh access token via cookie",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "New access token",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Token refreshed successfully" },
                      accessToken: { type: "string" },
                    },
                  },
                },
              },
            },
            401: errorRef("Unauthorized — missing/invalid token"),
            403: errorRef("Forbidden — invalid refresh token"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/auth/me": {
        get: {
          summary: "Get session user (rotates tokens)",
          tags: ["Auth", "User"],
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Session user + fresh tokens",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Authenticated User" },
                      accessToken: { type: "string" },
                      user: { $ref: "#/components/schemas/AuthUser" },
                    },
                  },
                },
              },
            },
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("User not found"),
            500: errorRef("Server error"),
          },
        },
        patch: {
          summary: "Update current user",
          tags: ["User"],
          security: bearer,
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    phone: { type: "string" },
                    dateOfBirth: { type: "string" },
                    occupation: { type: "string" },
                    profilepic: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "User Updated successfully" },
                      data: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            404: errorRef("User not found"),
            409: errorRef("Email already in use"),
            500: errorRef("Server error"),
          },
        },
      },


      "/api/v1/auth/forgot-password": {
        post: {
          summary: "Send password reset link",
          description: "Creates a short lived reset token, stores its hash on the user and emails the raw token. The token is also set as an httpOnly cookie so the reset page can be used on the same browser.",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: {
                    email: { type: "string", format: "email", example: "rohan@example.com" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Reset link sent to the provided email",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Password reset link has been sent to your email" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            404: errorRef("User not found"),
            500: errorRef("Server error"),
          },
        },
      },

      "/api/v1/auth/reset-password": {
        patch: {
          summary: "Reset password using token",
          description:
            "The token can be sent in the body, in the `token` query parameter or through the `passwordResetToken` cookie. It is single use and expires after 15 minutes.",
          tags: ["Auth"],
          parameters: [
            {
              in: "query",
              name: "token",
              required: false,
              schema: { type: "string" },
              description: "Reset token (alternative to the body field)",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["password"],
                  properties: {
                    token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                    password: { type: "string", format: "password", minLength: 8, example: "NewPassword123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Password reset successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Your password has been changed, please login again" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request or invalid/expired token"),
            401: errorRef("Unauthorized"),
            404: errorRef("User not found"),
            500: errorRef("Server error"),
          },
        },
      },

      // ---------------- Organization ----------------
      "/api/v1/organization": {
        post: {
          summary: "Create organization (you become OWNER)",
          tags: ["Organization"],
          security: bearer,
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["organization_name"],
                  properties: {
                    organization_name: { type: "string", example: "My Company" },
                    slug: { type: "string", example: "my_company" },
                    organization_description: { type: "string" },
                    organization_logo: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Organization created Successfully" },
                      data: { $ref: "#/components/schemas/Organization" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            409: errorRef("Name/slug already exists"),
            500: errorRef("Server error"),
          },
        },
        get: {
          summary: "List my organization memberships",
          tags: ["Organization"],
          security: bearer,
          responses: {
            200: {
              description: "Memberships",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/OrganizationMembershipPopulated",
                        },
                      },
                    },
                  },
                },
              },
            },
            401: errorRef("Unauthorized"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/organization/{organizationId}": {
        get: {
          summary: "Get one organization",
          tags: ["Organization"],
          security: bearer,
          parameters: [orgIdParam],
          responses: {
            200: {
              description: "Organization",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/Organization" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Not a member"),
            404: errorRef("Not found"),
            500: errorRef("Server error"),
          },
        },
        patch: {
          summary: "Update organization (OWNER/ADMIN)",
          tags: ["Organization"],
          security: bearer,
          parameters: [orgIdParam],
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    organization_name: { type: "string" },
                    slug: { type: "string" },
                    organization_description: { type: "string" },
                    organization_logo: {
                      type: "string",
                      format: "binary",
                      description: "Logo file (multer field `organization_logo`), or send URL string via JSON",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/Organization" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Not found"),
            409: errorRef("Duplicate name/slug"),
            500: errorRef("Server error"),
          },
        },
        delete: {
          summary: "Delete organization + cascade (OWNER)",
          tags: ["Organization"],
          security: bearer,
          parameters: [orgIdParam],
          responses: {
            200: {
              description: "Deleted",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { message: { type: "string" } },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Not found"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/organization/{organizationId}/me": {
        delete: {
          summary: "Leave organization",
          tags: ["Organization"],
          security: bearer,
          parameters: [orgIdParam],
          responses: {
            200: {
              description: "Left",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { message: { type: "string" } },
                  },
                },
              },
            },
            400: errorRef("Bad request — e.g. last owner"),
            401: errorRef("Unauthorized"),
            404: errorRef("Membership not found"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/organization/{organizationId}/member/me": {
        delete: {
          summary: "Leave organization (alias)",
          tags: ["Organization"],
          security: bearer,
          parameters: [orgIdParam],
          responses: {
            200: {
              description: "Left",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { message: { type: "string" } },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            404: errorRef("Membership not found"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/organization/{organizationId}/member": {
        get: {
          summary: "List organization members",
          tags: ["Organization"],
          security: bearer,
          parameters: [orgIdParam],
          responses: {
            200: {
              description: "Members (user populated with name/email)",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/OrganizationMemberPopulated" },
                      },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Not a member"),
            500: errorRef("Server error"),
          },
        },
        post: {
          summary: "Add member (OWNER/ADMIN; only OWNER can add ADMIN)",
          tags: ["Organization"],
          security: bearer,
          parameters: [orgIdParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["user_id", "role"],
                  properties: {
                    user_id: { type: "string" },
                    role: { type: "string", enum: ["ADMIN", "MEMBER"] },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Added",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/OrganizationMember" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("User not found"),
            409: errorRef("Already a member"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/organization/{organizationId}/member/{userId}": {
        patch: {
          summary: "Change member role (OWNER only)",
          tags: ["Organization"],
          security: bearer,
          parameters: [orgIdParam, userIdParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["role"],
                  properties: {
                    role: { type: "string", enum: ["ADMIN", "MEMBER"] },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Role changed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/OrganizationMember" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Not a member"),
            500: errorRef("Server error"),
          },
        },
        delete: {
          summary: "Remove member (OWNER/ADMIN)",
          tags: ["Organization"],
          security: bearer,
          parameters: [orgIdParam, userIdParam],
          responses: {
            200: {
              description: "Removed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { message: { type: "string" } },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Member not found"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/organization/{organizationId}/transfer-ownership": {
        post: {
          summary: "Transfer ownership (OWNER only)",
          tags: ["Organization"],
          security: bearer,
          parameters: [orgIdParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["targetUserId"],
                  properties: {
                    targetUserId: { type: "string", description: "New owner user id (also accepts `user_id`)" },
                    user_id: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Ownership transferred (you become ADMIN)",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: {
                        type: "object",
                        properties: {
                          newOwner: { $ref: "#/components/schemas/OrganizationMember" },
                          previousOwner: { $ref: "#/components/schemas/OrganizationMember" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Only OWNER can transfer"),
            404: errorRef("Target is not a member"),
            500: errorRef("Server error"),
          },
        },
      },

      // ---------------- Project ----------------
      "/api/v1/organization/{organizationId}/projects": {
        post: {
          summary: "Create project (OWNER/ADMIN)",
          tags: ["Project"],
          security: bearer,
          parameters: [orgIdParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["project_name"],
                  properties: {
                    project_name: { type: "string", example: "Website Revamp" },
                    project_description: {
                      type: "string",
                      example: "Rebuild the marketing site",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/Project" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            409: errorRef("Project name already exists"),
            500: errorRef("Server error"),
          },
        },
        get: {
          summary: "List projects in organization",
          tags: ["Project"],
          security: bearer,
          parameters: [
            orgIdParam,
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
            { name: "sort", in: "query", schema: { type: "string", example: "createdAt" } },
          ],
          responses: {
            200: {
              description: "Projects + pagination",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { type: "array", items: { $ref: "#/components/schemas/Project" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/organization/{organizationId}/projects/{projectId}": {
        get: {
          summary: "Get one project",
          tags: ["Project"],
          security: bearer,
          parameters: [orgIdParam, projectIdParam],
          responses: {
            200: {
              description: "Project",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/Project" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Not found"),
            500: errorRef("Server error"),
          },
        },
        patch: {
          summary: "Rename project (OWNER/ADMIN)",
          tags: ["Project"],
          security: bearer,
          parameters: [orgIdParam, projectIdParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["project_name"],
                  properties: { project_name: { type: "string" } },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/Project" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Not found"),
            500: errorRef("Server error"),
          },
        },
        delete: {
          summary: "Delete project + tasks (OWNER)",
          tags: ["Project"],
          security: bearer,
          parameters: [orgIdParam, projectIdParam],
          responses: {
            200: {
              description: "Deleted",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { message: { type: "string" } },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Not found"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/organization/{organizationId}/projects/{projectId}/members": {
        post: {
          summary: "Add project member (OWNER/ADMIN; user must be org member)",
          tags: ["Project"],
          security: bearer,
          parameters: [orgIdParam, projectIdParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["user_id"],
                  properties: { user_id: { type: "string" } },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Added",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/ProjectMember" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("User/project not found"),
            409: errorRef("Already a project member"),
            500: errorRef("Server error"),
          },
        },
        get: {
          summary: "List project members",
          tags: ["Project"],
          security: bearer,
          parameters: [orgIdParam, projectIdParam],
          responses: {
            200: {
              description: "Members",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/ProjectMemberPopulated",
                        },
                      },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Project not found"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/organization/{organizationId}/projects/{projectId}/members/{userId}": {
        delete: {
          summary: "Remove project member (OWNER/ADMIN)",
          tags: ["Project"],
          security: bearer,
          parameters: [orgIdParam, projectIdParam, userIdParam],
          responses: {
            200: {
              description: "Removed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { message: { type: "string" } },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Member/project not found"),
            500: errorRef("Server error"),
          },
        },
      },

      // ---------------- Task ----------------
      "/api/v1/organization/{organizationId}/projects/{projectId}/tasks": {
        post: {
          summary: "Create task (OWNER/ADMIN)",
          tags: ["Task"],
          security: bearer,
          parameters: [orgIdParam, projectIdParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["task_name"],
                  properties: {
                    task_name: { type: "string", example: "Fix login bug" },
                    description: { type: "string" },
                    status: { type: "string", enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"] },
                    priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
                    type: { type: "string", enum: ["Feature", "Bug", "Improvement", "Task", "Documentation"] },
                    due_date: { type: "string", format: "date-time" },
                    assignee_id: { type: "string", description: "Must be an org member" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/TaskPopulated" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Assignee not found"),
            500: errorRef("Server error"),
          },
        },
        get: {
          summary: "List tasks (filter + paginate)",
          tags: ["Task"],
          security: bearer,
          parameters: [
            orgIdParam,
            projectIdParam,
            { name: "status", in: "query", schema: { type: "string", enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"] } },
            { name: "priority", in: "query", schema: { type: "string", enum: ["Low", "Medium", "High", "Critical"] } },
            { name: "type", in: "query", schema: { type: "string", enum: ["Feature", "Bug", "Improvement", "Task", "Documentation"] } },
            { name: "assignee_id", in: "query", schema: { type: "string" } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: {
              description: "Tasks + pagination",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { type: "array", items: { $ref: "#/components/schemas/TaskPopulated" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/organization/{organizationId}/projects/{projectId}/tasks/{taskId}": {
        get: {
          summary: "Get task details",
          tags: ["Task"],
          security: bearer,
          parameters: [orgIdParam, projectIdParam, taskIdParam],
          responses: {
            200: {
              description: "Task",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/TaskPopulated" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Task not found"),
            500: errorRef("Server error"),
          },
        },
        patch: {
          summary: "Update task (OWNER/ADMIN)",
          tags: ["Task"],
          security: bearer,
          parameters: [orgIdParam, projectIdParam, taskIdParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    task_name: { type: "string" },
                    description: { type: "string", nullable: true },
                    status: { type: "string", enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"] },
                    priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
                    type: { type: "string", enum: ["Feature", "Bug", "Improvement", "Task", "Documentation"] },
                    due_date: { type: "string", format: "date-time", nullable: true },
                    assignee_id: { type: "string", nullable: true },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Updated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/TaskPopulated" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Task/assignee not found"),
            500: errorRef("Server error"),
          },
        },
        delete: {
          summary: "Delete task - soft delete (OWNER/ADMIN)",
          tags: ["Task"],
          security: bearer,
          parameters: [orgIdParam, projectIdParam, taskIdParam],
          responses: {
            200: {
              description: "Deleted",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { message: { type: "string" } },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Task not found"),
            500: errorRef("Server error"),
          },
        },
      },
      "/api/v1/organization/{organizationId}/projects/{projectId}/tasks/{taskId}/assign": {
        patch: {
          summary: "Assign / unassign task (OWNER/ADMIN)",
          tags: ["Task"],
          security: bearer,
          parameters: [orgIdParam, projectIdParam, taskIdParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    assignee_id: {
                      type: "string",
                      nullable: true,
                      description: "User id, or null/empty to unassign",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Assigned / unassigned",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      data: { $ref: "#/components/schemas/TaskPopulated" },
                    },
                  },
                },
              },
            },
            400: errorRef("Bad request"),
            401: errorRef("Unauthorized"),
            403: errorRef("Forbidden"),
            404: errorRef("Task/assignee not found"),
            500: errorRef("Server error"),
          },
        },
      },

      // ---------------- Health ----------------
      "/api/v1/health": {
        get: {
          summary: "Health check",
          tags: ["Health"],
          responses: {
            200: {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "OK" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
});
