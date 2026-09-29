import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Multi-Tenant Developer Collaboration Platform",
      version: "1.0.0",
      description:
        "API documentation for the Multi Tenant SaaS application. All error responses are standardized by `backend/src/middlewares/error-middleware.ts:29` -> `errorHandler` with shape `{ success: false, message, errors? }`. See schemas `ErrorResponse` / `ValidationErrorResponse`. NOTE: user-auth controllers return `{ success, message, ... }` but organization/project controllers return `{ message, data }` with NO `success` field — documented per-controller below.",
    },

    servers: [
      {
        url: "http://localhost:8000",
        description: "Local development server",
      },
      {
        url: "http://10.10.10.15:8000",
        description: " development server",
      },
    ],

    tags: [
      {
        name: "Authentication",
        description: "User authentication APIs (register/login/logout/refresh/me)",
      },
      {
        name: "User",
        description: "Current-user profile APIs (GET /me, PATCH /me)",
      },
      {
        name: "Organization",
        description: "Organization management APIs",
      },
      {
        name: "Organization Members",
        description: "Organization member management APIs",
      },
      {
        name: "Project",
        description: "Project management APIs",
      },
      {
        name: "Project Members",
        description: "Project member management APIs",
      },
      {
        name: "Task",
        description: "Task management APIs",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },

        refreshTokenCookie: {
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
            success: {
              type: "boolean",
              example: false,
              description: "Always false for errors (error-middleware.ts:95)",
            },
            message: {
              type: "string",
              example: "Error message",
              description: "Human readable message from AppError or errorHandler transform",
            },
            errors: {
              type: "array",
              description:
                "Optional details. For ValidationError (400) -> [{field,message}], Duplicate (409) -> keyValue, ZodError (400) -> issues, CastError has no errors but message is `Invalid ${path}: ${value}` (error-middleware.ts:41-78)",
              items: { type: "object" },
              example: [{ field: "email", message: "Email is Required" }],
            },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          required: ["success", "message", "errors"],
          properties: {
            success: { type: "boolean", example: false },
            message: {
              type: "string",
              example: "Validation failed",
              description: "Mongoose ValidationError or ZodError mapped to 400 (error-middleware.ts:41-78)",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "organization_name" },
                  message: { type: "string", example: "Organization Name is Required" },
                },
              },
            },
          },
        },
        DuplicateErrorResponse: {
          type: "object",
          required: ["success", "message"],
          properties: {
            success: { type: "boolean", example: false },
            message: {
              type: "string",
              example: "Duplicate value for email",
              description: "MongoServerError code 11000 mapped to 409 (error-middleware.ts:57-62)",
            },
            errors: {
              type: "object",
              description: "err.keyValue e.g. { email: 'rohan@example.com' }",
              example: { email: "rohan@example.com" },
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
            data: { type: "object", description: "Payload varies per endpoint" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "68c123456789abcdef123456",
            },
            name: {
              type: "string",
              example: "Rohan",
            },
            email: {
              type: "string",
              format: "email",
              example: "rohan@example.com",
            },
            phone: {
              type: "string",
              example: "9876543210",
            },
            dateOfBirth: {
              type: "string",
              example: "2000-01-15",
            },
            profilepic: {
              type: "string",
              example: "uploads/profile-123.jpg",
              description: "Multer file path (`req.file.path`) or empty string",
            },
          },
        },
        AuthUser: {
          type: "object",
          description: "Shape returned by login / authMe (user-auth-controller.ts:96,201) — note: no phone/dateOfBirth",
          properties: {
            id: { type: "string", example: "68c123456789abcdef123456" },
            name: { type: "string", example: "Rohan" },
            email: { type: "string", format: "email", example: "rohan@example.com" },
            profilepic: { type: "string", example: "uploads/profile-123.jpg" },
          },
        },

        Organization: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "68c123456789abcdef123456",
            },
            organization_name: {
              type: "string",
              example: "My Company",
            },
            slug: {
              type: "string",
              example: "my-company",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-20T12:00:00.000Z",
            },
          },
        },

        OrganizationMember: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "68c987654321abcdef654321",
            },
            organization_id: {
              type: "string",
              example: "68c123456789abcdef123456",
            },
            user_id: {
              type: "string",
              example: "68c555555555abcdef555555",
            },
            role: {
              type: "string",
              enum: ["OWNER", "ADMIN", "MEMBER"],
              example: "MEMBER",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-20T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-20T12:00:00.000Z",
            },
          },
        },

        OrganizationMemberWithUser: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "68c987654321abcdef654321",
            },
            organization_id: {
              type: "string",
              example: "68c123456789abcdef123456",
            },
            user_id: {
              type: "object",
              properties: {
                _id: {
                  type: "string",
                  example: "68c555555555abcdef555555",
                },
                name: {
                  type: "string",
                  example: "Rohan",
                },
                email: {
                  type: "string",
                  format: "email",
                  example: "rohan@example.com",
                },
              },
            },
            role: {
              type: "string",
              enum: ["OWNER", "ADMIN", "MEMBER"],
              example: "MEMBER",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        Project: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "68c123456789abcdef123456",
            },
            project_name: {
              type: "string",
              example: "My Project",
            },
            organization_id: {
              type: "string",
              example: "68c987654321abcdef654321",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-20T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-20T12:00:00.000Z",
            },
          },
        },

        ProjectMember: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "68c987654321abcdef654321",
            },
            project_id: {
              type: "string",
              example: "68c123456789abcdef123456",
            },
            user_id: {
              type: "string",
              example: "68c555555555abcdef555555",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-20T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-09-20T12:00:00.000Z",
            },
          },
        },

        ProjectMemberWithUser: {
          type: "object",
          description: "Populated by `getAllMemberInProject` (.populate('user_id','name email'))",
          properties: {
            _id: { type: "string", example: "68c987654321abcdef654321" },
            project_id: { type: "string", example: "68c123456789abcdef123456" },
            user_id: {
              type: "object",
              properties: {
                _id: { type: "string", example: "68c555555555abcdef555555" },
                name: { type: "string", example: "Rohan" },
                email: { type: "string", format: "email", example: "rohan@example.com" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        Task: {
          type: "object",
          description: "Task document (`backend/src/models/task-model.ts`). Enums from `VALID_TASK_STATUSES` / `VALID_TASK_PRIORITIES` / `VALID_TASK_TYPES`.",
          properties: {
            _id: { type: "string", example: "68c123456789abcdef123456" },
            task_name: { type: "string", example: "Fix login bug", description: "Required, trimmed, 1-200 chars" },
            description: { type: "string", example: "Login fails on expired token", description: "Optional, max 5000 chars, default ''" },
            status: {
              type: "string",
              enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"],
              example: "TODO",
            },
            priority: {
              type: "string",
              enum: ["Low", "Medium", "High", "Critical"],
              example: "Medium",
            },
            type: {
              type: "string",
              enum: ["Feature", "Bug", "Improvement", "Task", "Documentation"],
              example: "Bug",
            },
            due_date: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: "2026-10-15T00:00:00.000Z",
              description: "Optional, must be a valid date if provided",
            },
            project_id: { type: "string", example: "68c123456789abcdef123456" },
            organization_id: { type: "string", example: "68c987654321abcdef654321" },
            creator_id: { type: "string", example: "68c555555555abcdef555555" },
            assignee_id: {
              type: "string",
              nullable: true,
              example: "68c555555555abcdef555555",
              description: "Optional, must be an existing user AND an organization member",
            },
            is_deleted: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        TaskWithUser: {
          type: "object",
          description: "Populated by `getTaskDetails` / `getAllTask` (.populate('assignee_id','name').populate('creator_id','name'))",
          properties: {
            _id: { type: "string", example: "68c123456789abcdef123456" },
            task_name: { type: "string", example: "Fix login bug" },
            description: { type: "string", example: "Login fails on expired token" },
            status: {
              type: "string",
              enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"],
              example: "TODO",
            },
            priority: {
              type: "string",
              enum: ["Low", "Medium", "High", "Critical"],
              example: "Medium",
            },
            type: {
              type: "string",
              enum: ["Feature", "Bug", "Improvement", "Task", "Documentation"],
              example: "Bug",
            },
            due_date: { type: "string", format: "date-time", nullable: true },
            project_id: { type: "string", example: "68c123456789abcdef123456" },
            organization_id: { type: "string", example: "68c987654321abcdef654321" },
            creator_id: {
              type: "object",
              properties: {
                _id: { type: "string", example: "68c555555555abcdef555555" },
                name: { type: "string", example: "Rohan" },
              },
            },
            assignee_id: {
              type: "object",
              nullable: true,
              properties: {
                _id: { type: "string", example: "68c555555555abcdef555555" },
                name: { type: "string", example: "Rohan" },
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
      // ============================================================
      // AUTHENTICATION
      // ============================================================

      "/api/v1/auth/register": {
        post: {
          summary: "Register a new user",
          description:
            "Creates a new user account. Route `backend/src/routes/user-routes.ts:16` -> `upload.single('profilepic')` -> `registerUser` `backend/src/controllers/user-auth-controller.ts:16`. Controller throws AppError 400 for missing name/email/password, 409 for duplicate email; model requires phone (ValidationError 400 if missing). `error-middleware.ts:41-62` maps Mongoose ValidationError (400) and duplicate key 11000 (409). Success is 201 with `profilepic` = `req.file.path` or empty string.",
          tags: ["Authentication"],

          requestBody: {
            required: true,

            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",

                  required: ["name", "email", "password", "phone"],

                  properties: {
                    name: {
                      type: "string",
                      example: "Rohan",
                    },

                    email: {
                      type: "string",
                      format: "email",
                      example: "rohan@example.com",
                    },

                    password: {
                      type: "string",
                      format: "password",
                      example: "Password123",
                    },

                    phone: {
                      type: "string",
                      example: "9876543210",
                      description: "Required by user-model.ts (unique, sparse). Missing -> 400 Validation failed.",
                    },

                    dateOfBirth: {
                      type: "string",
                      example: "2000-01-15",
                    },

                    profilepic: {
                      type: "string",
                      format: "binary",
                      description: "Optional profile image file (multer field `profilepic`)",
                    },
                  },
                },
              },
            },
          },

          responses: {
            201: {
              description: "User created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "User Created Successfully" },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "68c123456789abcdef123456" },
                          name: { type: "string", example: "Rohan" },
                          email: { type: "string", example: "rohan@example.com" },
                          phone: { type: "string", example: "9876543210" },
                          dateOfBirth: { type: "string", example: "2000-01-15" },
                          profilepic: { type: "string", example: "uploads/profile-123.jpg" },
                        },
                      },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - AppError `Name, email and password are required` (400) or Mongoose ValidationError mapped by `error-middleware.ts:41` to 400 `Validation failed` with errors[] (e.g. phone required, invalid email).",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/ValidationErrorResponse" },
                    ],
                  },
                  examples: {
                    appError: {
                      summary: "AppError missing fields",
                      value: { success: false, message: "Name, email and password are required" },
                    },
                    validation: {
                      summary: "Mongoose ValidationError (phone required)",
                      value: {
                        success: false,
                        message: "Validation failed",
                        errors: [{ field: "phone", message: "phone is Required" }],
                      },
                    },
                  },
                },
              },
            },

            409: {
              description:
                "Conflict - AppError `User Already Exists` (409) when email exists or Duplicate key 11000 mapped by `error-middleware.ts:57` to 409 `Duplicate value for email/phone`.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DuplicateErrorResponse" },
                  examples: {
                    exists: {
                      summary: "User already exists",
                      value: { success: false, message: "User Already Exists" },
                    },
                    duplicateKey: {
                      summary: "Mongo duplicate key",
                      value: {
                        success: false,
                        message: "Duplicate value for email",
                        errors: { email: "rohan@example.com" },
                      },
                    },
                  },
                },
              },
            },

            500: {
              description: "Internal server error - standardized by `error-middleware.ts:35` fallback 500 `{ success:false, message }`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      "/api/v1/auth/login": {
        post: {
          summary: "Login user",
          description:
            "Authenticates a user and returns an access token. The refresh token is stored in an HTTP-only cookie. Controller `backend/src/controllers/user-auth-controller.ts:58` + error-middleware mapping. Response `user` contains only `{ id, name, email, profilepic }`.",
          tags: ["Authentication"],

          requestBody: {
            required: true,

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  required: ["email", "password"],

                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "rohan@example.com",
                    },

                    password: {
                      type: "string",
                      format: "password",
                      example: "Password123",
                    },
                  },
                },
              },
            },
          },

          responses: {
            200: {
              description: "Login successful",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "Logged in successfully",
                      },

                      accessToken: {
                        type: "string",
                        example: "eyJhbGciOiJIUzI1NiIs...",
                      },

                      user: {
                        $ref: "#/components/schemas/AuthUser",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - AppError `Email and password are required` (400) from `user-auth-controller.ts:62`.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Email and password are required" },
                },
              },
            },

            401: {
              description: "Unauthorized - AppError `Invalid credentials` (401) when password mismatch (`user-auth-controller.ts:76`). Standard shape `error-middleware.ts:95`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid credentials" },
                },
              },
            },

            404: {
              description: "Not found - AppError `User not found` (404) when email not found (`user-auth-controller.ts:70`)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "User not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      "/api/v1/auth/logout": {
        post: {
          summary: "Logout user",
          description:
            "Logs out the current user and clears the refresh token cookie. Controller `backend/src/controllers/user-auth-controller.ts:105` never throws AppError - always 200 even if no cookie. Errors only via `error-middleware.ts` 500 fallback. No auth required.",
          tags: ["Authentication"],

          security: [
            {
              refreshTokenCookie: [],
            },
          ],

          responses: {
            200: {
              description: "Logout successful - either `No refresh token found` (no cookie) or `Logged out successfully`",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Logged out successfully" },
                    },
                  },
                  example: { success: true, message: "Logged out successfully" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      "/api/v1/auth/refresh": {
        post: {
          summary: "Refresh access token",
          description:
            "Generates a new access token using the refresh token stored in the HTTP-only cookie. Controller `backend/src/controllers/user-auth-controller.ts:141` + error-middleware. Does NOT rotate the refresh token (unlike GET /me).",
          tags: ["Authentication"],

          security: [
            {
              refreshTokenCookie: [],
            },
          ],

          responses: {
            200: {
              description: "Access token refreshed successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "Token refreshed successfully",
                      },

                      accessToken: {
                        type: "string",
                        example: "eyJhbGciOiJIUzI1NiIs...",
                      },
                    },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized - AppError `Refresh token missing` (401) when cookie absent (`user-auth-controller.ts:146`) or JWT errors `Invalid token`/`Token expired` via `error-middleware.ts:65-71`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Refresh token missing" },
                },
              },
            },

            403: {
              description: "Forbidden - AppError `Invalid refresh token` (403) when token not found in DB (`user-auth-controller.ts:152`)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid refresh token" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      // ============================================================
      // CURRENT USER
      // ============================================================

      "/api/v1/auth/me": {
        get: {
          summary: "Get authenticated user (rotates tokens)",
          description:
            "Verifies the refresh token cookie, rotates both tokens and returns the user. Route `backend/src/routes/user-routes.ts:20` -> `authMe` `backend/src/controllers/user-auth-controller.ts:165`. Uses `jwt.verify(cookie, REFRESH_TOKEN_KEY)` directly (no Bearer auth). Sets a new `refreshToken` HTTP-only cookie. JWT errors map via `error-middleware.ts:65` to 401 `Invalid token` / `Token expired`.",
          tags: ["User", "Authentication"],

          security: [
            {
              refreshTokenCookie: [],
            },
          ],

          responses: {
            200: {
              description: "Authenticated user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Authenticated User" },
                      accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                      user: { $ref: "#/components/schemas/AuthUser" },
                    },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized - AppError `Token not found` (401) when cookie absent (`user-auth-controller.ts:170`), or `Invalid token` / `Token expired` (401) from jwt.verify via error-middleware",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token not found" },
                },
              },
            },

            404: {
              description: "Not found - AppError `User not found` (404) when decoded id has no user (`user-auth-controller.ts:181`)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "User not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },

        patch: {
          summary: "Update current user",
          description:
            "Updates name/email/phone/dateOfBirth/profilepic for the Bearer-authenticated user. Route `backend/src/routes/user-routes.ts:21` -> `authMiddleware` (401) -> `upload.single('profilepic')` -> `updateMe` `backend/src/controllers/user-auth-controller.ts:211`. Only non-empty fields are applied; empty body -> 400 `No valid fields provided for update`. Email is lowercased and checked for uniqueness -> 409 `Email already in use`. Uses `findByIdAndUpdate(runValidators:true)` so ValidationError 400 / duplicate 409 apply.",
          tags: ["User"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Rohan Updated" },
                    email: { type: "string", format: "email", example: "rohan.new@example.com" },
                    phone: { type: "string", example: "9876543210" },
                    dateOfBirth: { type: "string", example: "2000-01-15" },
                    profilepic: {
                      type: "string",
                      format: "binary",
                      description: "Optional new profile image (multer field `profilepic`, saved as `req.file.path`)",
                    },
                  },
                },
              },
            },
          },

          responses: {
            200: {
              description: "User updated successfully",
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

            400: {
              description: "Bad request - `No valid fields provided for update` (400) when body empty/blank, or ValidationError 400 `Validation failed`, CastError 400",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/ValidationErrorResponse" },
                    ],
                  },
                  example: { success: false, message: "No valid fields provided for update" },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / User Not Found (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            404: {
              description: "Not found - `User not found` (404) when userId has no user",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "User not found" },
                },
              },
            },

            409: {
              description: "Conflict - `Email already in use` (409) or duplicate key 11000 via error-middleware",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DuplicateErrorResponse" },
                  example: { success: false, message: "Email already in use" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      // ============================================================
      // ORGANIZATION
      // ============================================================

      "/api/v1/organization": {
        post: {
          summary: "Create an organization",
          description:
            "Creates a new organization and makes the authenticated user its OWNER in a mongoose transaction. Route `backend/src/routes/organization-routes.ts:20` -> `authMiddleware` (401) -> `createOrganization` `backend/src/controllers/organization-controller.ts:23`. Slug defaults to `organization_name.trim().toLowerCase().replaceAll(' ','_')`. Duplicate slug/name caught in-session -> 409 `Organization name already exists`. NOTE: success response has NO `success` field: `{ message, data }`. error-middleware maps ValidationError 400, duplicate 409, CastError 400, AppError codes.",
          tags: ["Organization"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          requestBody: {
            required: true,

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  required: ["organization_name"],

                  properties: {
                    organization_name: {
                      type: "string",
                      example: "My Company",
                    },

                    slug: {
                      type: "string",
                      example: "my-company",
                      description: "Optional, auto-generated from organization_name lowercased with _ if not provided",
                    },
                  },
                },
              },
            },
          },

          responses: {
            201: {
              description: "Organization created successfully (shape `{ message, data }`, no `success` field)",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "Organization created Successfully",
                      },

                      data: {
                        $ref: "#/components/schemas/Organization",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - AppError `Organization Name cannot be Empty` (400) or Mongoose ValidationError 400 `Validation failed` (e.g., `organization_name` required, `Slug cannot be Empty`) via `error-middleware.ts:41`, or CastError 400, or ZodError 400.",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/ValidationErrorResponse" },
                    ],
                  },
                  examples: {
                    appError: {
                      summary: "Missing name",
                      value: { success: false, message: "Organization Name cannot be Empty" },
                    },
                    validation: {
                      summary: "Validation failed",
                      value: {
                        success: false,
                        message: "Validation failed",
                        errors: [{ field: "organization_name", message: "Organization Name is Required" }],
                      },
                    },
                  },
                },
              },
            },

            401: {
              description:
                "Unauthorized - `auth-middleware.ts:23` `Token Not Found` / `Session Expired` / `User Not Found` (401) or `error-middleware.ts:65` `Invalid token` / `Token expired`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  examples: {
                    tokenNotFound: { summary: "No Bearer", value: { success: false, message: "Token Not Found" } },
                    sessionExpired: { summary: "JWT expired", value: { success: false, message: "Session Expired" } },
                    invalidToken: { summary: "JWT error", value: { success: false, message: "Invalid token" } },
                  },
                },
              },
            },

            409: {
              description:
                "Conflict - AppError `Organization name already exists` (409) on duplicate slug/name inside the transaction (`organization-controller.ts:75`) or Duplicate key 11000 `Duplicate value for organization_name/slug` via `error-middleware.ts:57`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DuplicateErrorResponse" },
                  example: { success: false, message: "Duplicate value for slug", errors: { slug: "my-company" } },
                },
              },
            },

            500: {
              description:
                "Internal server error - e.g., AppError `Failed to create organization member` (500) or fallback 500",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },

        get: {
          summary: "Get all user's organizations",
          description:
            "Gets the organization memberships belonging to the authenticated user (populates `organization_id` with `organization_name` only). Route `backend/src/routes/organization-routes.ts:21` -> `authMiddleware` -> `getAllOrganization` `backend/src/controllers/organization-controller.ts:84`. Response shape `{ message, data }` with NO `success` field. Only auth errors.",
          tags: ["Organization"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          responses: {
            200: {
              description: "Organization data fetched successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "data fetched Successfully",
                      },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/OrganizationMember" },
                      },
                    },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / User Not Found (401) or Invalid token / Token expired",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}": {
        get: {
          summary: "Get an organization",
          description:
            "Gets an organization by ID. Chain `backend/src/routes/organization-routes.ts:22` -> `authMiddleware` (401) -> `requireOrganizationMember` `backend/src/middlewares/auth-organization-member.ts:7` (400 Invalid organization id / Forbidden: Invalid User Id, 404 Organization not found, 403 Forbidden not member) -> `getOrganization` (400,404). Response `{ message, data }`, no `success` field.",
          tags: ["Organization"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              description: "Organization ObjectId",
              example: "68c123456789abcdef123456",
            },
          ],

          responses: {
            200: {
              description: "Organization fetched successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "data fetched Successfully",
                      },

                      data: {
                        $ref: "#/components/schemas/Organization",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - AppError `Invalid organization id` (400) from `auth-organization-member.ts:19` or `organization-controller.ts:103`, or `Forbidden: Invalid User Id` (400), or CastError `Invalid _id: ...`, or ValidationError 400.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid organization id" },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / User Not Found / Invalid token / Token expired (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description:
                "Forbidden - AppError `Forbidden: You are not a member of this organization` (403) from `auth-organization-member.ts:43`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Forbidden: You are not a member of this organization" },
                },
              },
            },

            404: {
              description: "Not found - AppError `Organization not found` (404) from `auth-organization-member.ts:24` or `organization-controller.ts:108` or `notFound` 404 `Not Found - /api/v1/...`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Organization not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },

        patch: {
          summary: "Update organization data",
          description:
            "Updates the organization name and/or slug. Chain `backend/src/routes/organization-routes.ts:54` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `updateOrganizationData` `backend/src/controllers/organization-controller.ts:248` (400 invalid id, 400 At least one field required, 404 not found). Actual path is `PATCH /organization/:organizationId`. Duplicate key 11000 -> 409 via error-middleware, ValidationError 400 `Validation failed`. Response `{ message, data }`, no `success` field.",
          tags: ["Organization"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              example: "68c123456789abcdef123456",
            },
          ],

          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    organization_name: {
                      type: "string",
                      example: "My Updated Organization",
                    },

                    slug: {
                      type: "string",
                      example: "my-updated-organization",
                    },
                  },
                },

                example: {
                  organization_name: "My Updated Organization",
                  slug: "my-updated-organization",
                },
              },
            },
          },

          responses: {
            200: {
              description: "Organization data updated successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "Organization data has been changed.",
                      },
                      data: { $ref: "#/components/schemas/Organization" },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - `Invalid organization id` (400), `At least one field (organization_name or slug) is required` (400), ValidationError 400 `Validation failed` (e.g., Organization Name cannot be Empty, Slug cannot be Empty), CastError 400, ZodError 400",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/ValidationErrorResponse" },
                    ],
                  },
                  examples: {
                    atLeastOne: {
                      summary: "Missing fields",
                      value: { success: false, message: "At least one field (organization_name or slug) is required" },
                    },
                    validation: {
                      summary: "Validation failed",
                      value: {
                        success: false,
                        message: "Validation failed",
                        errors: [{ field: "slug", message: "Slug cannot be Empty" }],
                      },
                    },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / User Not Found / Invalid token / Token expired (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description:
                "Forbidden - `Forbidden: not a member` (403) or `You are not a member of this organization` / `You do not have permission...` (403) when role not OWNER/ADMIN via `auth-required-role.ts:14-22`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "You do not have permission to perform this action" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` (404) via requireOrganizationMember or `updateOrganizationData.ts:279`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Organization not found" },
                },
              },
            },

            409: {
              description: "Conflict - Duplicate key 11000 `Duplicate value for organization_name/slug` (409) via `error-middleware.ts:57` when slug/name already taken",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DuplicateErrorResponse" },
                  example: { success: false, message: "Duplicate value for slug", errors: { slug: "my-org" } },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },

        delete: {
          summary: "Delete an organization",
          description:
            "Deletes an organization with cascade (Projects -> Tasks -> ProjectMembers -> OrgMembers -> Org) in a transaction. Chain `backend/src/routes/organization-routes.ts:34` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER')` `backend/src/middlewares/auth-required-role.ts:7` (403 You are not a member / You do not have permission) -> `deleteOrganization` `backend/src/controllers/organization-controller.ts:190` (400 invalid id, 404 not found). Response `{ message }`, no `success` field.",
          tags: ["Organization"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              example: "68c123456789abcdef123456",
            },
          ],

          responses: {
            200: {
              description: "Organization deleted successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "Organization Deleted Successfully.",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - `Invalid organization id` (400) via `auth-organization-member.ts:19` or controller, or `Forbidden: Invalid User Id` (400)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid organization id" },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / User Not Found / Invalid token / Token expired (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description:
                "Forbidden - `Forbidden: You are not a member...` (403) or `You are not a member of this organization` (403) or `You do not have permission to perform this action` (403) when role != OWNER via `auth-required-role.ts:15-21`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "You do not have permission to perform this action" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` (404) via requireOrganizationMember or deleteOrganization",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Organization not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/me": {
        delete: {
          summary: "Leave an organization",
          description:
            "Removes the authenticated user from the organization and cleans up their project memberships in that org. Chain `backend/src/routes/organization-routes.ts:41` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `leaveOrganization` `backend/src/controllers/organization-controller.ts:135` (400 invalid id, 400 last-owner guard, 404 Membership not found). Alias: `DELETE /organization/:organizationId/member/me` (same handler, `organization-routes.ts:48`). Response `{ message }`, no `success` field.",
          tags: ["Organization"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              example: "68c123456789abcdef123456",
            },
          ],

          responses: {
            200: {
              description: "Successfully left the organization",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "You've left the Organization",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - `Invalid organization id` (400), or `Cannot leave: you are the last owner. Transfer ownership first ...` (400) via `leaveOrganization.ts:164`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  examples: {
                    invalid: { summary: "Invalid id", value: { success: false, message: "Invalid organization id" } },
                    lastOwner: {
                      summary: "Last owner",
                      value: {
                        success: false,
                        message: "Cannot leave: you are the last owner. Transfer ownership first via POST /organization/:organizationId/transfer-ownership",
                      },
                    },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired etc (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description: "Forbidden - `Forbidden: You are not a member...` (403) via requireOrganizationMember",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Forbidden: You are not a member of this organization" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` (404) or `Membership not found` (404) from `leaveOrganization.ts:153`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Membership not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/member/me": {
        delete: {
          summary: "Leave an organization (spec alias)",
          description:
            "Alias of `DELETE /organization/:organizationId/me` kept for spec compat. Same chain `backend/src/routes/organization-routes.ts:48` -> `authMiddleware` -> `requireOrganizationMember` -> `leaveOrganization` `backend/src/controllers/organization-controller.ts:135`. See `/api/v1/organization/{organizationId}/me` for full error docs. Response `{ message }`.",
          tags: ["Organization"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              example: "68c123456789abcdef123456",
            },
          ],

          responses: {
            200: {
              description: "Successfully left the organization",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "You've left the Organization" },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - `Invalid organization id` (400) or last-owner guard (400)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid organization id" },
                },
              },
            },

            401: {
              description: "Unauthorized (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description: "Forbidden (403)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Forbidden: You are not a member of this organization" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` / `Membership not found` (404)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Membership not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      // ============================================================
      // ORGANIZATION MEMBERS
      // ============================================================

      "/api/v1/organization/{organizationId}/member": {
        get: {
          summary: "Get organization members",
          description:
            "Gets all members of an organization (populates `user_id` with `name email`). Chain `backend/src/routes/organization-routes.ts:28` -> `authMiddleware` (401) -> `requireOrganizationMember` (400 Invalid organization id / Forbidden: Invalid User Id, 404 Organization not found, 403 Forbidden not member) -> `getOrganizationMembers` `backend/src/controllers/organization-controller.ts:117` (400 invalid id). Response `{ message, data }`, no `success` field.",
          tags: ["Organization Members"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              example: "68c123456789abcdef123456",
            },
          ],

          responses: {
            200: {
              description: "Organization members fetched successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "All Organization Member Data fetched.",
                      },

                      data: {
                        type: "array",

                        items: {
                          $ref: "#/components/schemas/OrganizationMemberWithUser",
                        },
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - `Invalid organization id` (400) via middleware or controller, `Forbidden: Invalid User Id` (400), CastError 400, ValidationError 400",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid organization id" },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / Invalid token / Token expired (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description: "Forbidden - `Forbidden: You are not a member...` (403) via requireOrganizationMember",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Forbidden: You are not a member of this organization" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` (404) via requireOrganizationMember",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Organization not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },

        post: {
          summary: "Add a member to an organization",
          description:
            "Adds a user to an organization with role ADMIN or MEMBER (OWNER is blocked). Chain `backend/src/routes/organization-routes.ts:64` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `addMember` `backend/src/controllers/organization-controller.ts:291` (400 User and role required, 400 Invalid organization/user id, 400 Role must be one of..., 400 Cannot assign OWNER..., 403 Only OWNER can assign ADMIN, 404 Target user not found, 409 User already member). Role is normalized via `trim().toUpperCase()`. Response `{ message, data }`, no `success` field.",
          tags: ["Organization Members"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              example: "68c123456789abcdef123456",
            },
          ],

          requestBody: {
            required: true,

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  required: ["user_id", "role"],

                  properties: {
                    user_id: {
                      type: "string",
                      example: "68c555555555abcdef555555",
                    },

                    role: {
                      type: "string",

                      enum: ["ADMIN", "MEMBER"],

                      example: "MEMBER",
                      description: "OWNER is rejected with 400; only OWNER can assign ADMIN (403 otherwise)",
                    },
                  },
                },
              },
            },
          },

          responses: {
            201: {
              description: "User added successfully (`{ message, data }`)",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "User added successfully",
                      },

                      data: {
                        $ref: "#/components/schemas/OrganizationMember",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - `User and role are required` (400), `Invalid organization id` (400), `Invalid user id` (400), `Role must be one of: OWNER, ADMIN, MEMBER` (400), `Cannot assign OWNER via this endpoint...` (400), `Target user is not a member of this organization` is 404 (not 400) — see 404; `Referenced User Does Not Exist` ValidationError 400, CastError 400",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/ValidationErrorResponse" },
                    ],
                  },
                  examples: {
                    missing: { summary: "Missing fields", value: { success: false, message: "User and role are required" } },
                    invalidRole: {
                      summary: "Invalid role",
                      value: { success: false, message: "Role must be one of: OWNER, ADMIN, MEMBER" },
                    },
                    cannotOwner: {
                      summary: "Cannot assign OWNER",
                      value: {
                        success: false,
                        message: "Cannot assign OWNER via this endpoint. Use POST /organization/:organizationId/transfer-ownership",
                      },
                    },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / Invalid token (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description:
                "Forbidden - `Forbidden: not a member` (403) or `You do not have permission...` (403) when role != OWNER/ADMIN or `Only OWNER can assign ADMIN` (403) via `addMember.ts:332`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  examples: {
                    notMember: {
                      summary: "Not org member",
                      value: { success: false, message: "Forbidden: You are not a member of this organization" },
                    },
                    noPermission: {
                      summary: "No role permission",
                      value: { success: false, message: "You do not have permission to perform this action" },
                    },
                    onlyOwnerAdmin: {
                      summary: "Only OWNER can assign ADMIN",
                      value: { success: false, message: "Only OWNER can assign ADMIN" },
                    },
                  },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` (404) via requireOrganizationMember or `Target user not found` (404) via `addMember.ts:338`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Target user not found" },
                },
              },
            },

            409: {
              description:
                "Conflict - `User is already a member of this organization` (409) via `addMember.ts:356` (unique index organization_id+user_id) or Duplicate key 11000 via `error-middleware.ts:57`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DuplicateErrorResponse" },
                  example: { success: false, message: "User is already a member of this organization" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/member/{userId}": {
        patch: {
          summary: "Change a member role in organization",
          description:
            "Changes the role of an org member to ADMIN or MEMBER. Actual route `backend/src/routes/organization-routes.ts:72` is `PATCH /organization/:organizationId/member/:userId` with body `{ role }` only — `userId` comes from the path (NOT the body). Chain -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER')` (403, OWNER only) -> `changeMemberRole` `backend/src/controllers/organization-controller.ts:364` (400 User Not Found/Invalid organization id/Role required/Role must be one of/Cannot assign OWNER/Cannot demote last owner, 403 Only OWNER can assign ADMIN, 404 Target not member). Response `{ message, data }`.",
          tags: ["Organization Members"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              description: "Organization ID",
              example: "68c123456789abcdef123456",
            },
            {
              name: "userId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              description: "User ID whose role should be changed",
              example: "68c555555555abcdef555555",
            },
          ],

          requestBody: {
            required: true,

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  required: ["role"],

                  properties: {
                    role: {
                      type: "string",

                      enum: ["ADMIN", "MEMBER"],

                      example: "ADMIN",
                      description: "OWNER is rejected with 400 (use transfer-ownership)",
                    },
                  },
                },
              },
            },
          },

          responses: {
            200: {
              description: "Role has been changed for the user (`{ message, data }`)",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "Role has been changed for the user",
                      },
                      data: { $ref: "#/components/schemas/OrganizationMember" },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - `User Not Found` (400) invalid userId, `Invalid organization id` (400), `Role is required` (400), `Role must be one of...` (400), `Cannot assign OWNER via this endpoint...` (400), `Cannot demote the last owner...` (400) via `changeMemberRole.ts:424`, CastError 400, ValidationError 400",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/ValidationErrorResponse" },
                    ],
                  },
                  examples: {
                    userNotFound: { summary: "Invalid userId", value: { success: false, message: "User Not Found" } },
                    roleRequired: { summary: "Role missing", value: { success: false, message: "Role is required" } },
                    cannotDemote: {
                      summary: "Last owner",
                      value: { success: false, message: "Cannot demote the last owner of an organization" },
                    },
                    cannotOwner: {
                      summary: "Cannot assign OWNER",
                      value: { success: false, message: "Cannot assign OWNER via this endpoint. Use transfer-ownership" },
                    },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / Invalid token / Token expired (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description:
                "Forbidden - `Forbidden: not a member` (403), `You do not have permission...` (403) requires OWNER via `auth-required-role.ts`, or `Only OWNER can assign ADMIN` (403) via `changeMemberRole.ts:434`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  examples: {
                    notOwner: {
                      summary: "Requires OWNER",
                      value: { success: false, message: "You do not have permission to perform this action" },
                    },
                    onlyOwnerAdmin: {
                      summary: "Only OWNER can assign ADMIN",
                      value: { success: false, message: "Only OWNER can assign ADMIN" },
                    },
                  },
                },
              },
            },

            404: {
              description:
                "Not found - `Organization not found` (404) via requireOrganizationMember or `Target user is not a member of this organization` (404) via `changeMemberRole.ts:411`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Target user is not a member of this organization" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },

        delete: {
          summary: "Remove a member from an organization",
          description:
            "Removes a user from an organization. Chain `backend/src/routes/organization-routes.ts:79` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `removeMember` `backend/src/controllers/organization-controller.ts:447` (400 Invalid ids, 400 Use leave to remove yourself, 400 Cannot remove last owner, 404 Organization member not found). Self-removal is blocked — use `DELETE /organization/:organizationId/me`. Response `{ message }`.",
          tags: ["Organization Members"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              example: "68c123456789abcdef123456",
            },

            {
              name: "userId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              example: "68c555555555abcdef555555",
            },
          ],

          responses: {
            200: {
              description: "User removed successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "User removed successfully",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - `Invalid organization id` (400), `Invalid user id` (400), `Use DELETE /organization/:organizationId/leave to remove yourself` (400) via `removeMember.ts:464`, `Cannot remove the last owner...` (400) via `removeMember.ts:485`, CastError 400",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  examples: {
                    invalid: { summary: "Invalid id", value: { success: false, message: "Invalid organization id" } },
                    selfRemove: {
                      summary: "Self removal",
                      value: { success: false, message: "Use DELETE /organization/:organizationId/leave to remove yourself" },
                    },
                    lastOwner: {
                      summary: "Last owner",
                      value: { success: false, message: "Cannot remove the last owner of an organization" },
                    },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / Invalid token (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description:
                "Forbidden - `Forbidden: not a member` (403) or `You do not have permission...` (403) when role != OWNER/ADMIN",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "You do not have permission to perform this action" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` (404) or `Organization member not found` (404) via `removeMember.ts:475`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Organization member not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      // ============================================================
      // PROJECT
      // ============================================================

      "/api/v1/organization/{organizationId}/projects": {
        post: {
          summary: "Create a project",
          description:
            "Creates a new project under the specified organization and adds the authenticated user as a project member in a transaction. Actual route `POST /organization/:organizationId/projects` in `backend/src/routes/project-routes.ts:19` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `createProject` `backend/src/controllers/project-controller.ts:14` (400 Project name required, 400 Invalid organization id, 409 duplicate name, 500 Failed to create project, duplicate 11000 -> 409). Response `{ message, data }`, no `success` field.",
          tags: ["Project"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              description: "Organization ID the project belongs to",
              example: "68c123456789abcdef123456",
            },
          ],

          requestBody: {
            required: true,

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  required: ["project_name"],

                  properties: {
                    project_name: {
                      type: "string",
                      description: "Name of the project (trimmed, non-empty; globally unique per project-model)",
                      example: "My Project",
                    },
                  },
                },

                example: {
                  project_name: "My Project",
                },
              },
            },
          },

          responses: {
            201: {
              description: "Project created successfully (`{ message, data }`)",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "Project Created Successfully",
                      },

                      data: {
                        $ref: "#/components/schemas/Project",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - AppError `Project name is required` (400) or `Invalid organization id` (400) via `project-controller.ts:19-28`, or Mongoose ValidationError 400 `Validation failed` (e.g., Project Name cannot be Empty, Referenced Organization Does Not Exist) via `error-middleware.ts:41`, or CastError 400, or ZodError 400.",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/ValidationErrorResponse" },
                    ],
                  },
                  examples: {
                    missingName: {
                      summary: "Missing project_name",
                      value: { success: false, message: "Project name is required" },
                    },
                    invalidOrg: {
                      summary: "Invalid org id",
                      value: { success: false, message: "Invalid organization id" },
                    },
                    validation: {
                      summary: "Validation failed",
                      value: {
                        success: false,
                        message: "Validation failed",
                        errors: [{ field: "project_name", message: "Project Name cannot be empty" }],
                      },
                    },
                  },
                },
              },
            },

            401: {
              description:
                "Unauthorized - `Token Not Found` / `Session Expired` / `User Not Found` (401) via `auth-middleware.ts:23-38` or `Invalid token` / `Token expired` (401) via `error-middleware.ts:65`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  examples: {
                    tokenNotFound: { summary: "No Bearer", value: { success: false, message: "Token Not Found" } },
                    sessionExpired: { summary: "JWT expired", value: { success: false, message: "Session Expired" } },
                  },
                },
              },
            },

            403: {
              description:
                "Forbidden - `Forbidden: You are not a member of this organization` (403) via `requireOrganizationMember.ts:43` or `You do not have permission to perform this action` (403) requires OWNER or ADMIN via `auth-required-role.ts:20`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  examples: {
                    notMember: {
                      summary: "Not a member",
                      value: { success: false, message: "Forbidden: You are not a member of this organization" },
                    },
                    noPermission: {
                      summary: "Wrong role",
                      value: { success: false, message: "You do not have permission to perform this action" },
                    },
                  },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` (404) via `requireOrganizationMember.ts:24`, or `Not Found - /api/...` via notFound handler `error-middleware.ts:24`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Organization not found" },
                },
              },
            },

            409: {
              description: "Conflict - AppError `A project with this name already exists in this organization` (409) via `project-controller.ts:37` or Duplicate key 11000 `Project already exists` (409) (project_name is globally unique)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DuplicateErrorResponse" },
                  example: { success: false, message: "A project with this name already exists in this organization" },
                },
              },
            },

            500: {
              description:
                "Internal server error - e.g., `Failed to create project` (500) via `project-controller.ts:50` or fallback 500",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },

        get: {
          summary: "Get all projects for an organization",
          description:
            "Retrieves all projects belonging to the specified organization. Chain `GET /organization/:organizationId/projects` in `backend/src/routes/project-routes.ts:27` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `getAllProject` `backend/src/controllers/project-controller.ts:71` (400 Invalid organization id). Response `{ message, data }`.",
          tags: ["Project"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              description: "Organization ID to list projects for",
              example: "68c123456789abcdef123456",
            },
          ],

          responses: {
            200: {
              description: "All projects fetched successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "All projects data has been fetch",
                      },

                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Project",
                        },
                      },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - `Invalid organization id` (400) via `auth-organization-member.ts:19` or `getAllProject.ts:79`, or `Forbidden: Invalid User Id` (400), CastError 400, ValidationError 400",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid organization id" },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / User Not Found / Invalid token / Token expired (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description:
                "Forbidden - `Forbidden: You are not a member...` (403) or `You do not have permission...` (403) requires OWNER or ADMIN",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "You do not have permission to perform this action" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` (404) or `Not Found - /api/...` (404)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Organization not found" },
                },
              },
            },

            500: {
              description: "Internal server error - fallback 500 via `error-middleware.ts:95`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/projects/{projectId}": {
        get: {
          summary: "Get a specific project",
          description:
            "Retrieves a specific project by ID with tenant isolation. Chain `GET /organization/:organizationId/projects/:projectId` in `backend/src/routes/project-routes.ts:36` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireProjectAccess` `backend/src/middlewares/auth-project-member.ts:7` (400 Invalid ids / Forbidden: Invalid User Id, 404 Project not found, 403 tenant mismatch / not a project member, 401 not authenticated) -> `getProject` `backend/src/controllers/project-controller.ts:92` (400 Invalid ids, 404 Project not found, 403 Project does not belong / You are not a member of this project when org role is MEMBER). OWNER/ADMIN bypass project-membership check in the middleware; controller re-checks MEMBER role. Response `{ message, data }`.",
          tags: ["Project"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              description: "Organization ID the project belongs to",
              example: "68c123456789abcdef123456",
            },
            {
              name: "projectId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              description: "Project ID to retrieve",
              example: "68c123456789abcdef123456",
            },
          ],

          responses: {
            200: {
              description: "Project fetched successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "Project fetched successfully",
                      },

                      data: {
                        $ref: "#/components/schemas/Project",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - `Invalid organization id` / `Invalid project id` (400) via requireOrganizationMember/requireProjectAccess/getProject, `Forbidden: Invalid User Id` (400), CastError 400, ValidationError 400",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/ValidationErrorResponse" },
                    ],
                  },
                  examples: {
                    invalidProject: { summary: "Invalid project id", value: { success: false, message: "Invalid project id" } },
                    invalidOrg: { summary: "Invalid org id", value: { success: false, message: "Invalid organization id" } },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / User Not Found (401) or `Unauthorized: User not authenticated` (401) via requireProjectAccess",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description:
                "Forbidden - `Forbidden: You are not a member of this organization` (403), `Project does not belong to this organization` (403) via middleware or `getProject.ts:117`, `Forbidden: You are not a member of this Project` (403) via middleware, `You are not a member of this project` (403) via `getProject.ts:127` when org role is MEMBER without project membership",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  examples: {
                    notOrgMember: {
                      summary: "Not org member",
                      value: { success: false, message: "Forbidden: You are not a member of this organization" },
                    },
                    notProjectMember: {
                      summary: "Not project member",
                      value: { success: false, message: "Forbidden: You are not a member of this Project" },
                    },
                    tenant: {
                      summary: "Tenant isolation",
                      value: { success: false, message: "Project does not belong to this organization" },
                    },
                  },
                },
              },
            },

            404: {
              description:
                "Not found - `Organization not found` (404) via requireOrganizationMember, `Project not found` (404) via `auth-project-member.ts:30` or `getProject.ts:114`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project not found" },
                },
              },
            },

            500: {
              description: "Internal server error - fallback 500 via errorHandler",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },

        patch: {
          summary: "Update a project",
          description:
            "Updates a project name. Actual route `PATCH /organization/:organizationId/projects/:projectId` in `backend/src/routes/project-routes.ts:44` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `updateProject` `backend/src/controllers/project-controller.ts:138` (400 Project name required, 400 Invalid ids, 404 Project not found, 403 Project does not belong). Response `{ message, data }`.",
          tags: ["Project"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              description: "Organization ID the project belongs to",
              example: "68c123456789abcdef123456",
            },
            {
              name: "projectId",
              in: "path",
              required: true,

              schema: {
                type: "string",
              },

              description: "Project ID to update",
              example: "68c123456789abcdef123456",
            },
          ],

          requestBody: {
            required: true,

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  required: ["project_name"],

                  properties: {
                    project_name: {
                      type: "string",
                      description: "New name for the project (trimmed, non-empty)",
                      example: "My Updated Project",
                    },
                  },
                },

                example: {
                  project_name: "My Updated Project",
                },
              },
            },
          },

          responses: {
            200: {
              description: "Project updated successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "Project Name has been Updated",
                      },

                      data: {
                        $ref: "#/components/schemas/Project",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - `Project name is required` (400) via `updateProject.ts:148`, `Invalid project id` / `Invalid organization id` (400), or ValidationError 400 `Validation failed` (e.g., Project Name cannot be empty), CastError 400, ZodError 400",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/ValidationErrorResponse" },
                    ],
                  },
                  examples: {
                    missingName: {
                      summary: "Missing name",
                      value: { success: false, message: "Project name is required" },
                    },
                    invalidIds: {
                      summary: "Invalid ids",
                      value: { success: false, message: "Invalid project id" },
                    },
                    validation: {
                      summary: "Validation failed",
                      value: {
                        success: false,
                        message: "Validation failed",
                        errors: [{ field: "project_name", message: "Project Name cannot be empty" }],
                      },
                    },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / User Not Found / Invalid token / Token expired (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description:
                "Forbidden - `Forbidden: not a member` (403), `You do not have permission...` (403) requires OWNER/ADMIN, `Project does not belong to this organization` (403) via `updateProject.ts:167` tenant isolation",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  examples: {
                    notMember: {
                      summary: "Not org member",
                      value: { success: false, message: "Forbidden: You are not a member of this organization" },
                    },
                    tenant: {
                      summary: "Tenant isolation",
                      value: { success: false, message: "Project does not belong to this organization" },
                    },
                  },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` (404) via requireOrganizationMember or `Project not found` (404) via `updateProject.ts:164`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project not found" },
                },
              },
            },

            409: {
              description: "Conflict - Duplicate key 11000 (409) via `error-middleware.ts:57` since `project_name` is globally unique",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DuplicateErrorResponse" },
                  example: { success: false, message: "Duplicate value for project_name" },
                },
              },
            },

            500: {
              description: "Internal server error - fallback 500 via errorHandler",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },

        delete: {
          summary: "Delete a project",
          description:
            "Deletes a project with cascade (Tasks + ProjectMembers + Project) in a transaction. Route `backend/src/routes/project-routes.ts:82` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER')` (403, OWNER only) -> `requireProjectAccess` (400,404,403,401) -> `deleteProject` `backend/src/controllers/project-controller.ts:343` (400 Invalid ids, 404 Project not found, 403 tenant mismatch). Response `{ message }`.",
          tags: ["Project"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
            {
              name: "projectId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
          ],

          responses: {
            200: {
              description: "Project deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Project deleted successfully" },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - `Invalid organization id` / `Invalid project id` (400), `Forbidden: Invalid User Id` (400)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid project id" },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / User Not Found / `Unauthorized: User not authenticated` (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description: "Forbidden - not org member / `You do not have permission...` requires OWNER / `Project does not belong to this organization` / `Forbidden: You are not a member of this Project` (403)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "You do not have permission to perform this action" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` / `Project not found` (404)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      // ============================================================
      // PROJECT MEMBERS
      // ============================================================

      "/api/v1/organization/{organizationId}/projects/{projectId}/members": {
        post: {
          summary: "Add a member to a project",
          description:
            "Adds an organization member to a project. Route `backend/src/routes/project-routes.ts:55` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `requireProjectAccess` (400,404,403,401) -> `addMemberInProject` `backend/src/controllers/project-controller.ts:181`. Body is `{ user_id }` only (no role). Inline checks: tenant isolation 403, target user exists 404, target must be org member else 400, duplicate 409. Response `{ message, data }` with 201 `User Added Successfully`.",
          tags: ["Project Members"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
            {
              name: "projectId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
          ],

          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["user_id"],
                  properties: {
                    user_id: {
                      type: "string",
                      example: "68c555555555abcdef555555",
                      description: "Must be an existing user AND an organization member",
                    },
                  },
                },
              },
            },
          },

          responses: {
            201: {
              description: "User added to project successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "User Added Successfully" },
                      data: { $ref: "#/components/schemas/ProjectMember" },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - `Invalid organization id` / `Invalid project id` / `Invalid user id` (400), or `Target user is not a member of this organization` (400) via `addMemberInProject.ts:225`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  examples: {
                    invalid: { summary: "Invalid id", value: { success: false, message: "Invalid user id" } },
                    notOrgMember: {
                      summary: "Not org member",
                      value: { success: false, message: "Target user is not a member of this organization" },
                    },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description: "Forbidden - not org member / wrong org role / `Project does not belong to this organization` / not a project member (403)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project does not belong to this organization" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` / `Project not found` / `Target user not found` (404)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Target user not found" },
                },
              },
            },

            409: {
              description: "Conflict - `User is already a member of this project` (409) via explicit check or duplicate key 11000",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DuplicateErrorResponse" },
                  example: { success: false, message: "User is already a member of this project" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },

        get: {
          summary: "Get all members of a project",
          description:
            "Lists project members (populates `user_id` with `name email`). Route `backend/src/routes/project-routes.ts:64` -> `authMiddleware` -> `requireOrganizationMember` -> `requireOrganizationRole('OWNER','ADMIN')` -> `requireProjectAccess` -> `getAllMemberInProject` `backend/src/controllers/project-controller.ts:259` (400 Invalid ids, 404 Project not found, 403 tenant mismatch). Response `{ message: 'Project members fetched successfully', data }`.",
          tags: ["Project Members"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
            {
              name: "projectId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
          ],

          responses: {
            200: {
              description: "Project members fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Project members fetched successfully" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/ProjectMemberWithUser" },
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - `Invalid organization id` / `Invalid project id` (400)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid project id" },
                },
              },
            },

            401: {
              description: "Unauthorized (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description: "Forbidden - not org member / wrong org role / tenant mismatch / not a project member (403)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project does not belong to this organization" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` / `Project not found` (404)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/projects/{projectId}/members/{userId}": {
        delete: {
          summary: "Remove a member from a project",
          description:
            "Removes a user from a project. Route `backend/src/routes/project-routes.ts:73` -> `authMiddleware` -> `requireOrganizationMember` -> `requireOrganizationRole('OWNER','ADMIN')` -> `requireProjectAccess` -> `removeMemberFromProject` `backend/src/controllers/project-controller.ts:298` (400 Invalid org/project/user id, 404 Project not found, 403 tenant mismatch, 404 Project member not found). Response `{ message: 'User removed from project successfully' }`.",
          tags: ["Project Members"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
            {
              name: "projectId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
            {
              name: "userId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c555555555abcdef555555",
            },
          ],

          responses: {
            200: {
              description: "User removed from project successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "User removed from project successfully" },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - `Invalid organization id` / `Invalid project id` / `Invalid user id` (400)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid user id" },
                },
              },
            },

            401: {
              description: "Unauthorized (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description: "Forbidden - not org member / wrong org role / tenant mismatch / not a project member (403)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project does not belong to this organization" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` / `Project not found` / `Project member not found` (404)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project member not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      // ============================================================
      // TASK
      // ============================================================

      "/api/v1/organization/{organizationId}/projects/{projectId}/tasks": {
        post: {
          summary: "Create a task",
          description:
            "Creates a task under a project (tenant-scoped). Route `backend/src/routes/task-routes.ts:9` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `requireProjectAccess` (400,404,403,401) -> `createTask` `backend/src/controllers/task-controller.ts:13` (400 Invalid org/project id, 400 Task name required / max 200, 400 Description string / max 5000, 400 invalid status/priority/type enum, 400 Invalid due date, 400 Invalid assignee id / Assignee must be org member, 401 not authenticated, 404 Assignee user not found, ValidationError 400 via `error-middleware.ts:41`). `creator_id` is taken from the auth token, `is_deleted` forced false. Response `{ message, data }` with 201.",
          tags: ["Task"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
            {
              name: "projectId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
          ],

          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["task_name"],
                  properties: {
                    task_name: {
                      type: "string",
                      example: "Fix login bug",
                      description: "Required, trimmed non-empty, max 200 chars",
                    },
                    description: {
                      type: "string",
                      example: "Login fails on expired token",
                      description: "Optional, max 5000 chars",
                    },
                    status: {
                      type: "string",
                      enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"],
                      example: "TODO",
                      description: "Optional, defaults to TODO",
                    },
                    priority: {
                      type: "string",
                      enum: ["Low", "Medium", "High", "Critical"],
                      example: "Medium",
                      description: "Optional, defaults to Medium",
                    },
                    type: {
                      type: "string",
                      enum: ["Feature", "Bug", "Improvement", "Task", "Documentation"],
                      example: "Bug",
                      description: "Optional, defaults to Task",
                    },
                    due_date: {
                      type: "string",
                      format: "date-time",
                      example: "2026-10-15T00:00:00.000Z",
                      description: "Optional, must be a valid date; null/empty clears it",
                    },
                    assignee_id: {
                      type: "string",
                      example: "68c555555555abcdef555555",
                      description: "Optional, must be an existing user AND an organization member",
                    },
                  },
                },
                example: {
                  task_name: "Fix login bug",
                  description: "Login fails on expired token",
                  status: "TODO",
                  priority: "High",
                  type: "Bug",
                  due_date: "2026-10-15T00:00:00.000Z",
                  assignee_id: "68c555555555abcdef555555",
                },
              },
            },
          },

          responses: {
            201: {
              description: "Task created successfully (`{ message, data }`)",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Task created successfully" },
                      data: { $ref: "#/components/schemas/Task" },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - `Invalid organization id` / `Invalid project id` / `Invalid assignee id` (400), `Task name is required` (400), `Task Name Cannot Exceed 200 Characters` (400), `Description must be a string` / `Description Cannot Exceed 5000 Characters` (400), `Status must be one of...` / `Priority must be one of...` / `Type must be one of...` (400), `Invalid due date` (400), `Assignee must be a member of this organization` (400), ValidationError 400 `Validation failed`, CastError 400",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/ValidationErrorResponse" },
                    ],
                  },
                  examples: {
                    missingName: { summary: "Missing name", value: { success: false, message: "Task name is required" } },
                    invalidEnum: {
                      summary: "Invalid enum",
                      value: { success: false, message: "Status must be one of: TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED" },
                    },
                    notOrgMember: {
                      summary: "Assignee not org member",
                      value: { success: false, message: "Assignee must be a member of this organization" },
                    },
                  },
                },
              },
            },

            401: {
              description: "Unauthorized - Token Not Found / Session Expired / User Not Found / `Unauthorized: User not authenticated` (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description: "Forbidden - not org member / `You do not have permission...` requires OWNER or ADMIN / `Project does not belong to this organization` / `Forbidden: You are not a member of this Project` (403)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "You do not have permission to perform this action" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` / `Project not found` / `Assignee user not found` (404)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Assignee user not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },

        get: {
          summary: "Get all tasks of a project",
          description:
            "Lists non-deleted tasks of a project (tenant-scoped, sorted `createdAt:-1`, populates `assignee_id`/`creator_id` with `name`). Route `backend/src/routes/task-routes.ts:27` -> `authMiddleware` -> `requireOrganizationMember` -> `requireProjectAccess` -> `getAllTask` `backend/src/controllers/task-controller.ts:182` (400 Invalid org/project id, 400 invalid status/priority/type/assignee_id/search query). Supports `?status=&priority=&type=&assignee_id=&search=` (`$text` on `task_name`+`description`). Response `{ message, data }`.",
          tags: ["Task"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
            {
              name: "projectId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
            {
              name: "status",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"] },
            },
            {
              name: "priority",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["Low", "Medium", "High", "Critical"] },
            },
            {
              name: "type",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["Feature", "Bug", "Improvement", "Task", "Documentation"] },
            },
            {
              name: "assignee_id",
              in: "query",
              required: false,
              schema: { type: "string" },
              example: "68c555555555abcdef555555",
            },
            {
              name: "search",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Full-text search on task_name + description (non-empty, max 100 chars)",
              example: "login bug",
            },
          ],

          responses: {
            200: {
              description: "All tasks fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "All the task data fetched" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/TaskWithUser" },
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - `Invalid organization id` / `Invalid project id` / `Invalid assignee id` (400), invalid status/priority/type enum (400), `Search must be a non-empty string` / `Search query too long` (400)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid project id" },
                },
              },
            },

            401: {
              description: "Unauthorized (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description: "Forbidden - not org member / tenant mismatch / not a project member (403)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project does not belong to this organization" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` / `Project not found` (404)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/projects/{projectId}/tasks/{taskId}": {
        get: {
          summary: "Get task details",
          description:
            "Gets a single non-deleted task with tenant isolation (`_id` + `project_id` + `organization_id`). Route `backend/src/routes/task-routes.ts:18` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireProjectAccess` (400,404,403,401) -> `getTaskDetails` `backend/src/controllers/task-controller.ts:142` (400 Invalid org/project/task id, 404 Task not found). Populates `assignee_id`/`creator_id` with `name`. Response `{ message, data }`.",
          tags: ["Task"],

          security: [
            {
              bearerAuth: [],
            },
          ],

          parameters: [
            {
              name: "organizationId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
            {
              name: "projectId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
            {
              name: "taskId",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68c123456789abcdef123456",
            },
          ],

          responses: {
            200: {
              description: "Task fetched successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string", example: "Task data fetched" },
                      data: { $ref: "#/components/schemas/TaskWithUser" },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - `Invalid organization id` / `Invalid project id` / `Invalid task id` (400)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid task id" },
                },
              },
            },

            401: {
              description: "Unauthorized (401)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Token Not Found" },
                },
              },
            },

            403: {
              description: "Forbidden - not org member / tenant mismatch / not a project member (403)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project does not belong to this organization" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` / `Project not found` / `Task not found` (404, incl. soft-deleted or other-tenant tasks)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Task not found" },
                },
              },
            },

            500: {
              description: "Internal server error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Internal server error" },
                },
              },
            },
          },
        },
      },
    },
  },

  // We are defining everything directly in this file.
  apis: [],
});
