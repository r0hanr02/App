import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Multi-Tenant Developer Collaboration Platform",
      version: "1.0.0",
      description:
        "API documentation for the Multi Tenant SaaS application. All error responses are standardized by `backend/src/middlewares/error-middleware.ts:29` -> `errorHandler` with shape `{ success: false, message, errors? }`. See schemas `ErrorResponse` / `ValidationErrorResponse`.",
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
        description: "User authentication APIs",
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
          },
        },
      },
    },

    paths: {
      // ============================================================
      // AUTHENTICATION
      // ============================================================

      "/api/v1/register": {
        post: {
          summary: "Register a new user",
          description:
            "Creates a new user account. Controller `backend/src/controllers/user-auth-controller.ts:10` throws AppError 400 for missing name/email/password, 409 for duplicate email, and relies on `error-middleware.ts:41-62` for Mongoose ValidationError (400 Validation failed + errors[]) and duplicate key 11000 (409 Duplicate value). Success is 201.",
          tags: ["Authentication"],

          requestBody: {
            required: true,

            content: {
              "application/json": {
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
                    },

                    dateOfBirth: {
                      type: "string",
                      example: "2000-01-15",
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
                        },
                      },
                    },
                  },
                },
              },
            },

            400: {
              description:
                "Bad request - missing fields or validation failed. AppError `Name, email and password are required` (400) or Mongoose ValidationError mapped by `error-middleware.ts:41` to 400 `Validation failed` with errors[]. CastError also 400 `Invalid path: value`. ZodError 400 `Validation failed` with issues.",
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
                      summary: "Mongoose ValidationError",
                      value: {
                        success: false,
                        message: "Validation failed",
                        errors: [{ field: "email", message: "Email must be a valid email address" }],
                      },
                    },
                    cast: {
                      summary: "CastError",
                      value: { success: false, message: "Invalid _id: 123" },
                    },
                  },
                },
              },
            },

            409: {
              description:
                "Conflict - duplicate. AppError `User Already Exists` (409) when email exists or Duplicate key 11000 mapped by `error-middleware.ts:57` to 409 `Duplicate value for email/phone` with errors: keyValue.",
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

      "/api/v1/login": {
        post: {
          summary: "Login user",
          description:
            "Authenticates a user and returns an access token. The refresh token is stored in an HTTP-only cookie. Controller `backend/src/controllers/user-auth-controller.ts:44` + error-middleware mapping.",
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
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - AppError `Email and password are required` (400) from `user-auth-controller.ts:48`. Also ValidationError/ZodError/CastError 400 via error-middleware.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Email and password are required" },
                },
              },
            },

            401: {
              description: "Unauthorized - AppError `Invalid credentials` (401) when password mismatch (`user-auth-controller.ts:60`). Standard shape `error-middleware.ts:95`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid credentials" },
                },
              },
            },

            404: {
              description: "Not found - AppError `User not found` (404) when email not found (`user-auth-controller.ts:54`)",
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

      "/api/v1/logout": {
        post: {
          summary: "Logout user",
          description:
            "Logs out the current user and clears the refresh token cookie. Controller `backend/src/controllers/user-auth-controller.ts:88` never throws AppError - always 200 even if no cookie. Errors only via `error-middleware.ts` 500 fallback. No auth required.",
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

      "/api/v1/refresh": {
        post: {
          summary: "Refresh access token",
          description:
            "Generates a new access token using the refresh token stored in the HTTP-only cookie. Controller `backend/src/controllers/user-auth-controller.ts:124` + error-middleware.",
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
              description: "Unauthorized - AppError `Refresh token missing` (401) when cookie absent (`user-auth-controller.ts:128`) or JWT errors `Invalid token`/`Token expired` via `error-middleware.ts:65-71`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Refresh token missing" },
                },
              },
            },

            403: {
              description: "Forbidden - AppError `Invalid refresh token` (403) when token not found in DB (`user-auth-controller.ts:133`)",
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
      // ORGANIZATION
      // ============================================================

      "/api/v1/organization": {
        post: {
          summary: "Create an organization",
          description:
            "Creates a new organization and makes the authenticated user its owner. Route `backend/src/routes/organization-routes.ts:20` -> `authMiddleware` (401) -> `createOrganization` `backend/src/controllers/organization-controller.ts:16`. error-middleware maps ValidationError 400, duplicate 409, CastError 400, AppError codes.",
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
              description: "Organization created successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      success: { type: "boolean", example: true },
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
                "Bad request - AppError `Organization Name cannot be Empty` (400) or Mongoose ValidationError 400 `Validation failed` (e.g., `organization_name` required, `Slug cannot be Empty`) via `error-middleware.ts:41`, or CastError 400 `Invalid _id: value`, or ZodError 400.",
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
                "Conflict - AppError `Organization name already exists` (409) or Duplicate key 11000 `Duplicate value for organization_name/slug` via `error-middleware.ts:57`",
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
            "Gets the organization memberships belonging to the authenticated user. Route `backend/src/routes/organization-routes.ts:21` -> `authMiddleware` -> `getAllOrganization` `backend/src/controllers/organization-controller.ts:75`. Only auth errors.",
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
                      success: { type: "boolean", example: true },
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
            "Gets an organization by ID. Chain `backend/src/routes/organization-routes.ts:22` -> `authMiddleware` (401) -> `requireOrganizationMember` `backend/src/middlewares/auth-organization-member.ts:7` (400 Invalid organization id, 404 Organization not found, 403 Forbidden not member) -> `getOrganization` (400,404) -> errorHandler standard shape.",
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
                      success: { type: "boolean", example: true },
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
              description: "Bad request - AppError `Invalid organization id` (400) from `auth-organization-member.ts:16` or `organization-controller.ts:90` or CastError `Invalid _id: ...` or ValidationError 400. Also ZodError 400.",
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
                "Forbidden - AppError `Forbidden: You are not a member of this organization` (403) from `auth-organization-member.ts:32` or `requireOrganizationRole` 403",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Forbidden: You are not a member of this organization" },
                },
              },
            },

            404: {
              description: "Not found - AppError `Organization not found` (404) from `auth-organization-member.ts:21` or `organization-controller.ts:95` or `notFound` 404 `Not Found - /api/v1/...`",
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

        delete: {
          summary: "Delete an organization",
          description:
            "Deletes an organization and all organization memberships. Chain `backend/src/routes/organization-routes.ts:34` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER')` `backend/src/middlewares/auth-required-role.ts:7` (403 You are not a member / You do not have permission) -> `removeOrganization` `backend/src/controllers/organization-controller.ts:141` (400 invalid id).",
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
                      success: { type: "boolean", example: true },
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
              description: "Bad request - `Invalid organization id` (400) via `auth-organization-member.ts:16` or controller 400, or Validation/Cast/Zod 400",
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
      },

      "/api/v1/organization/{organizationId}/leave": {
        delete: {
          summary: "Leave an organization",
          description:
            "Removes the authenticated user from the organization. Chain `backend/src/routes/organization-routes.ts:41` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `leaveOrganization` `backend/src/controllers/organization-controller.ts:119` (400 invalid id, 404 Membership not found). errorHandler standardizes.",
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
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "You've leaved the Organization",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "Bad request - `Invalid organization id` (400) from middleware or controller, or Validation/CastError 400",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Invalid organization id" },
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
              description: "Not found - `Organization not found` (404) or `Membership not found` (404) from `leaveOrganization.ts:133`",
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

      "/api/v1/organization/{organizationId}/update": {
        patch: {
          summary: "Update organization data",
          description:
            "Updates the organization name and/or slug. Chain `backend/src/routes/organization-routes.ts:47` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `updateOrganizationData` `backend/src/controllers/organization-controller.ts:157` (400 invalid id, 400 At least one field required, 404 not found). Duplicate key 11000 -> 409 via error-middleware, ValidationError 400 `Validation failed`.",
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
                      success: { type: "boolean", example: true },
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
                "Bad request - `Invalid organization id` (400), `At least one field (organization_name or slug) is required` (400), ValidationError 400 `Validation failed` (e.g., Organization Name cannot be Empty, Slug cannot be Empty), CastError 400 `Invalid slug: ...`, ZodError 400",
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
                    cast: {
                      summary: "CastError",
                      value: { success: false, message: "Invalid organization_id: 123" },
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
                "Forbidden - `Forbidden: not a member` (403) or `You do not have permission...` (403) when role not OWNER/ADMIN via `auth-required-role.ts:20`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "You do not have permission to perform this action" },
                },
              },
            },

            404: {
              description: "Not found - `Organization not found` (404) via requireOrganizationMember or `updateOrganizationData.ts:180`",
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
      },

      // ============================================================
      // ORGANIZATION MEMBERS
      // ============================================================

      "/api/v1/organization/{organizationId}/member": {
        get: {
          summary: "Get organization members",
          description:
            "Gets all members of an organization. Chain `backend/src/routes/organization-routes.ts:28` -> `authMiddleware` (401) -> `requireOrganizationMember` (400 Invalid organization id, 404 Organization not found, 403 Forbidden not member) -> `getOrganizationMembers` `backend/src/controllers/organization-controller.ts:103` (400 invalid id). errorHandler standardizes.",
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
                      success: { type: "boolean", example: true },
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
              description: "Bad request - `Invalid organization id` (400) via middleware or controller, CastError 400, ValidationError 400",
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
            "Adds a user to an organization with the specified role. Chain `backend/src/routes/organization-routes.ts:57` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `addMember` `backend/src/controllers/organization-controller.ts:191` (400 User and role required, 400 Invalid organization/user id, 400 Role must be one of..., 400 Cannot assign OWNER..., 403 Only OWNER can assign ADMIN, 404 Target user not found, 409 User already member, ValidationError 400, duplicate 409).",
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

                      enum: ["OWNER", "ADMIN", "MEMBER"],

                      example: "MEMBER",
                    },
                  },
                },
              },
            },
          },

          responses: {
            201: {
              description: "User added successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      success: { type: "boolean", example: true },
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
                "Bad request - `User and role are required` (400), `Invalid organization id` (400), `Invalid user id` (400), `Role must be one of: OWNER, ADMIN, MEMBER` (400), `Cannot assign OWNER via this endpoint...` (400), CastError `Invalid user_id: ...` (400), ValidationError 400 `Validation failed` + errors[], ZodError 400",
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
                    validation: {
                      summary: "ValidationError",
                      value: {
                        success: false,
                        message: "Validation failed",
                        errors: [{ field: "role", message: "Role must be one of: OWNER, ADMIN, MEMBER" }],
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
                "Forbidden - `Forbidden: not a member` (403) or `You do not have permission...` (403) when role != OWNER/ADMIN or `Only OWNER can assign ADMIN` (403) via `addMember.ts:220`",
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
              description: "Not found - `Organization not found` (404) via requireOrganizationMember or `Target user not found` (404) via `addMember.ts:226` or `Not Found - /api/...` via notFound handler",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Target user not found" },
                },
              },
            },

            409: {
              description:
                "Conflict - `User is already a member of this organization` (409) via `addMember.ts:242` or Duplicate key 11000 `Duplicate value for organization_id` via `error-middleware.ts:57`",
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

      "/api/v1/organization/{organizationId}/change-role": {
        patch: {
          summary: "Change a Member Role in Organization",
          description:
            'Chain `backend/src/routes/organization-routes.ts:65` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole("OWNER")` (403) -> `changeMemberRole` `backend/src/controllers/organization-controller.ts:248` (400 User Not Found/invalid org/Role required, 400 Role must be one of..., 400 Cannot assign OWNER, 400 Cannot demote last owner, 403 Only OWNER can assign ADMIN, 404 Target not member). Matches `PATCH /api/v1/organization/:organizationId/change-role` guarded by `requireOrganizationRole("OWNER")` in `backend/src/routes/organization-routes.ts:65`.',
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
                      description: "User ID whose role should be changed",
                      example: "68c555555555abcdef555555",
                    },

                    role: {
                      type: "string",

                      enum: ["OWNER", "ADMIN", "MEMBER"],

                      example: "MEMBER",
                    },
                  },
                },
              },
            },
          },

          responses: {
            200: {
              description: "Role has been changed for the user",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      success: { type: "boolean", example: true },
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
                "Bad request - `User Not Found` (400) invalid user_id, `Invalid organization id` (400), `Role is required` (400), `Role must be one of...` (400), `Cannot assign OWNER via this endpoint...` (400), `Cannot demote the last owner...` (400) via `changeMemberRole.ts:292`, CastError 400, ValidationError 400",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/ErrorResponse" },
                      { $ref: "#/components/schemas/ValidationErrorResponse" },
                    ],
                  },
                  examples: {
                    userNotFound: { summary: "Invalid user_id", value: { success: false, message: "User Not Found" } },
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
                "Forbidden - `Forbidden: not a member` (403), `You do not have permission...` (403) requires OWNER via `auth-required-role.ts`, or `Only OWNER can assign ADMIN` (403) via `changeMemberRole.ts:297`",
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
                "Not found - `Organization not found` (404) via requireOrganizationMember or `Target user is not a member of this organization` (404) via `changeMemberRole.ts:281`",
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
      },

      "/api/v1/organization/{organizationId}/member/{userId}": {
        delete: {
          summary: "Remove a member from an organization",
          description:
            "Removes a user from an organization. Chain `backend/src/routes/organization-routes.ts:72` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `removeMember` `backend/src/controllers/organization-controller.ts:309` (400 Invalid ids, 400 Use leave to remove yourself, 400 Cannot remove last owner, 404 Organization member not found).",
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
                      success: { type: "boolean", example: true },
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
                "Bad request - `Invalid organization id` (400), `Invalid user id` (400), `Use DELETE /organization/:organizationId/leave to remove yourself` (400) via `removeMember.ts:323`, `Cannot remove the last owner...` (400) via `removeMember.ts:338`, CastError 400, ValidationError 400",
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
              description: "Not found - `Organization not found` (404) or `Organization member not found` (404) via `removeMember.ts:329`",
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

      "/api/v1/organization/{organizationId}/project": {
        post: {
          summary: "Create a project",
          description:
            "Creates a new project under the specified organization and adds the authenticated user as a project member. Chain `POST /api/v1/organization/:organizationId/project/create` in `backend/src/routes/project-routes.ts:15` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `createProject` `backend/src/controllers/project-controller.ts:8` (400 Project name required, 400 Invalid organization id, 404 Organization not found, 409 Project already exists, ValidationError 400, CastError 400, Duplicate 409). Uses mongoose transaction.",
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
                      description: "Name of the project (trimmed, non-empty)",
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
              description: "Project created successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      success: { type: "boolean", example: true },
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
                "Bad request - AppError `Project name is required` (400) or `Invalid organization id` (400) via `createProject.ts:14-21`, or Mongoose ValidationError 400 `Validation failed` with errors[] (e.g., Project Name cannot be empty, Referenced Organization Does Not Exist) via `error-middleware.ts:41`, or CastError 400 `Invalid organization_id: ...` / `Invalid _id: ...` via `error-middleware.ts:51`, or ZodError 400. Tenant validation also may produce ValidationError if organization does not exist.",
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
                    cast: {
                      summary: "CastError",
                      value: { success: false, message: "Invalid organization_id: 123" },
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
                "Forbidden - `Forbidden: You are not a member of this organization` (403) via `requireOrganizationMember.ts:32` or `You do not have permission to perform this action` (403) requires OWNER or ADMIN via `requireOrganizationRole` `backend/src/middlewares/auth-required-role.ts:20`",
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
              description: "Not found - `Organization not found` (404) via `requireOrganizationMember.ts:21` or `Project not found` via transaction validation, or `Not Found - /api/...` via notFound handler `error-middleware.ts:24`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Organization not found" },
                },
              },
            },

            409: {
              description: "Conflict - AppError `Project already exists` (409) via `project-controller.ts:47` duplicate check or Duplicate key 11000 `Duplicate value for ...` (409) via `error-middleware.ts:57`",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DuplicateErrorResponse" },
                  example: { success: false, message: "Project already exists" },
                },
              },
            },

            500: {
              description:
                "Internal server error - e.g., `Failed to create project` (500) via `project-controller.ts:33` or fallback 500 `{ success:false, message: 'Internal server error' }` logged via `error-middleware.ts:86`",
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

      "/api/v1/organization/{organizationId}/projects": {
        get: {
          summary: "Get all projects for an organization",
          description:
            "Retrieves all projects belonging to the specified organization. Chain `GET /api/v1/organization/:organizationId/projects` in `backend/src/routes/project-routes.ts:23` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `getAllProject` `backend/src/controllers/project-controller.ts:55` (400 Invalid organization id, 404 Organization not found). Note: `requireProjectMember` is commented out for this route, so only organization membership + role check applies. All errors standardized via `error-middleware.ts:29`.",
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
                      success: { type: "boolean", example: true },
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
                "Bad request - `Invalid organization id` (400) via `auth-organization-member.ts:16` or `getAllProject.ts:63`, or CastError 400 `Invalid organization_id: ...`, ValidationError 400 `Validation failed`, ZodError 400",
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
            "Retrieves a specific project by ID within an organization with tenant isolation. Chain `GET /api/v1/organization/:organizationId/projects/:projectId` in `backend/src/routes/project-routes.ts:32` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `requireProjectMember` `backend/src/middlewares/auth-project-member.ts:7` (400 Invalid project id, 404 Project not found, 403 Forbidden not a project member) -> `getProject` `backend/src/controllers/project-controller.ts:76` (400 Invalid ids, 404 Project not found, 403 Project does not belong to this organization / You are not a member of this project when org role is MEMBER). Tenant isolation enforced: project.organization_id must match organizationId else 403. All errors standardized `{ success:false, message, errors? }` via `error-middleware.ts:95`.",
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
                      success: { type: "boolean", example: true },
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
                "Bad request - `Invalid organization id` (400) via requireOrganizationMember, `Invalid project id` (400) via `auth-project-member.ts:16` or `getProject.ts:85`, CastError 400 `Invalid projectId: ...`, ValidationError 400 `Validation failed` + errors[], ZodError 400",
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
                    cast: { summary: "CastError", value: { success: false, message: "Invalid _id: 123" } },
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
                "Forbidden - `Forbidden: You are not a member of this organization` (403), `You do not have permission...` (403) requires OWNER/ADMIN, `Forbidden: You are not a member of this Project` (403) via `auth-project-member.ts:33`, `Project does not belong to this organization` (403) via `getProject.ts:101`, `You are not a member of this project` (403) via `getProject.ts:111` when org role is MEMBER without project membership",
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
                "Not found - `Organization not found` (404) via requireOrganizationMember, `Project not found` (404) via `auth-project-member.ts:21` or `getProject.ts:98`, or `Not Found - /api/...` (404) via notFound handler",
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
      },
      
      "/api/v1/organization/{organizationId}/projects/{projectId}/update": {
        patch: {
          summary: "Update a project",
          description:
            "Updates a project name. Chain `PATCH /api/v1/organization/:organizationId/projects/:projectId/update` in `backend/src/routes/project-routes.ts:41` -> `authMiddleware` (401) -> `requireOrganizationMember` (400,404,403) -> `requireOrganizationRole('OWNER','ADMIN')` (403) -> `updateProject` `backend/src/controllers/project-controller.ts:122` (400 Project name required, 400 Invalid ids, 404 Project not found, 403 Project does not belong). Note: `requireProjectMember` is commented out for this route, so project membership is not required -- only organization role OWNER/ADMIN. All errors standardized via `error-middleware.ts:95` with ValidationError 400, CastError 400, Duplicate 409 (if unique constraint added), ZodError 400.",
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
                      success: { type: "boolean", example: true },
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
                "Bad request - `Project name is required` (400) via `updateProject.ts:132`, `Invalid project id` (400) via `updateProject.ts:136`, `Invalid organization id` (400) via `updateProject.ts:142`, or ValidationError 400 `Validation failed` with errors[] (e.g., Project Name cannot be empty) via `error-middleware.ts:41`, CastError 400 `Invalid project_name: ...` / `Invalid _id: ...` via `error-middleware.ts:51`, ZodError 400. Also duplicate via ValidationError if organization ref fails.",
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
                "Forbidden - `Forbidden: not a member` (403), `You do not have permission...` (403) requires OWNER/ADMIN, `Project does not belong to this organization` (403) via `updateProject.ts:151` tenant isolation",
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
              description: "Not found - `Organization not found` (404) via requireOrganizationMember or `Project not found` (404) via `updateProject.ts:148` or notFound handler 404",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                  example: { success: false, message: "Project not found" },
                },
              },
            },

            409: {
              description: "Conflict - Duplicate key 11000 `Duplicate value for ...` (409) via `error-middleware.ts:57` if unique index added on project_name+organization_id (currently not unique, but documented for future).",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DuplicateErrorResponse" },
                  example: { success: false, message: "Duplicate value for project_name" },
                },
              },
            },

            500: {
              description: "Internal server error - fallback 500 via errorHandler, logged at `error-middleware.ts:86`",
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
