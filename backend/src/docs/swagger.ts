import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Multi-Tenant Developer Collaboration Platform",
      version: "1.0.0",
      description: "API documentation for the Multi Tenant SaaS application",
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
          description: "Creates a new user account.",
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
            200: {
              description: "User created successfully",
            },

            403: {
              description: "User already exists",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      "/api/v1/login": {
        post: {
          summary: "Login user",
          description:
            "Authenticates a user and returns an access token. The refresh token is stored in an HTTP-only cookie.",
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
              description: "Email and password are required",
            },

            401: {
              description: "Invalid credentials",
            },

            404: {
              description: "User not found",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      "/api/v1/logout": {
        post: {
          summary: "Logout user",
          description:
            "Logs out the current user and clears the refresh token cookie.",
          tags: ["Authentication"],

          security: [
            {
              refreshTokenCookie: [],
            },
          ],

          responses: {
            200: {
              description: "Logout successful",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      "/api/v1/refresh": {
        post: {
          summary: "Refresh access token",
          description:
            "Generates a new access token using the refresh token stored in the HTTP-only cookie.",
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
              description: "Refresh token missing",
            },

            403: {
              description: "Invalid refresh token",
            },

            500: {
              description: "Internal server error",
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
            "Creates a new organization and makes the authenticated user its owner.",
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

                  required: ["organization_name", "slug"],

                  properties: {
                    organization_name: {
                      type: "string",
                      example: "My Company",
                    },

                    slug: {
                      type: "string",
                      example: "my-company",
                    },
                  },
                },
              },
            },
          },

          responses: {
            200: {
              description: "Organization created successfully",

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      message: {
                        type: "string",
                        example: "Organization created Successfully",
                      },

                      organization: {
                        $ref: "#/components/schemas/Organization",
                      },
                    },
                  },
                },
              },
            },

            409: {
              description: "Organization name cannot be empty",
            },

            401: {
              description: "Authentication token is missing or invalid",
            },

            500: {
              description: "Internal server error",
            },
          },
        },

        get: {
          summary: "Get all user's organizations",
          description:
            "Gets the organization memberships belonging to the authenticated user.",
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
                    },
                  },
                },
              },
            },

            401: {
              description: "Authentication token is missing or invalid",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}": {
        get: {
          summary: "Get an organization",
          description:
            "Gets an organization by ID. The authenticated user must be a member of the organization.",
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

                      organization: {
                        $ref: "#/components/schemas/Organization",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "Invalid organization ID",
            },

            401: {
              description: "Authentication token is missing or invalid",
            },

            404: {
              description: "Organization not found",
            },

            500: {
              description: "Internal server error",
            },
          },
        },

        delete: {
          summary: "Delete an organization",
          description:
            "Deletes an organization and all organization memberships. Only OWNER or ADMIN can perform this operation.",
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

            401: {
              description: "Authentication token is missing or invalid",
            },

            403: {
              description: "User is not a member or does not have permission",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/leave": {
        delete: {
          summary: "Leave an organization",
          description: "Removes the authenticated user from the organization.",
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
                        example: "You've leaved the Organization",
                      },
                    },
                  },
                },
              },
            },

            401: {
              description: "Authentication token is missing or invalid",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/update": {
        patch: {
          summary: "Update organization data",
          description:
            "Updates the organization name and/or slug. Only the organization owner can update the organization.",
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
                    },
                  },
                },
              },
            },

            400: {
              description: "Invalid organization data",
            },

            401: {
              description: "Authentication token is missing or invalid",
            },

            403: {
              description: "User is not the owner of the organization",
            },

            404: {
              description: "Organization not found",
            },

            500: {
              description: "Internal server error",
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
            "Gets all members of an organization. The authenticated user must be a member of the organization.",
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

                      organizationMember: {
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

            401: {
              description: "Authentication token is missing or invalid",
            },

            500: {
              description: "Internal server error",
            },
          },
        },

        post: {
          summary: "Add a member to an organization",
          description:
            "Adds a user to an organization with the specified role. Only OWNER or ADMIN can perform this operation.",
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
                      message: {
                        type: "string",
                        example: "User added successfully",
                      },

                      member: {
                        $ref: "#/components/schemas/OrganizationMember",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "Missing user/role or invalid organization/user ID",
            },

            401: {
              description: "Authentication token is missing or invalid",
            },

            403: {
              description: "User is not a member or does not have permission",
            },

            409: {
              description: "User is already a member of this organization",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/change-role": {
        patch: {
          summary: "Change a Member Role in Organization",
          description:
            'Change the role of a user within the organization. Only OWNER can perform this operation. Matches `PATCH /api/v1/organization/:organizationId/change-role` guarded by `requireOrganizationRole("OWNER")` in `backend/src/routes/organization-routes.ts:65`.',
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
                      message: {
                        type: "string",
                        example: "Role has been changed for the user",
                      },
                    },
                  },
                },
              },
            },

            400: {
              description: "User Not Found - Invalid or missing user_id",
            },

            401: {
              description: "Authentication token is missing or invalid",
            },

            403: {
              description:
                "User is not a member or does not have permission (requires OWNER)",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/member/{userId}": {
        delete: {
          summary: "Remove a member from an organization",
          description:
            "Removes a user from an organization. Only OWNER or ADMIN can perform this operation.",
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
              description: "Invalid organization ID or user ID",
            },

            401: {
              description: "Authentication token is missing or invalid",
            },

            403: {
              description: "User is not a member or does not have permission",
            },

            404: {
              description: "Organization member not found",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      // ============================================================
      // PROJECT
      // ============================================================

      "/api/v1/organization/{organizationId}/project/create": {
        post: {
          summary: "Create a project",
          description:
            "Creates a new project under the specified organization and adds the authenticated user as a project member. Requires authentication and organization membership with role OWNER or ADMIN. Matches `POST /api/v1/organization/:organizationId/project/create` in `backend/src/routes/project-routes.ts:9` and `backend/src/controllers/project-controller.ts:6`.",
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
                      description: "Name of the project",
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
            200: {
              description: "Project created successfully",

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
                "Bad request - project_name missing or referenced organization/user validation failed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Check the response data properly!",
                      },
                    },
                  },
                },
              },
            },

            401: {
              description: "Authentication token is missing or invalid",
            },

            403: {
              description:
                "User is not a member or does not have permission (requires OWNER or ADMIN)",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/projects": {
        get: {
          summary: "Get all projects for an organization",
          description:
            "Retrieves all projects belonging to the specified organization. Requires authentication and organization membership with role OWNER or ADMIN. Matches `GET /api/v1/organization/:organizationId/projects` in `backend/src/routes/project-routes.ts:22` and `backend/src/controllers/project-controller.ts:42`. Note: `requireProjectMember` is commented out for this route, so only organization membership + role check applies.",
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

            401: {
              description: "Authentication token is missing or invalid",
            },

            403: {
              description:
                "User is not a member or does not have permission (requires OWNER or ADMIN)",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      "/api/v1/organization/{organizationId}/projects/{projectId}": {
        get: {
          summary: "Get a specific project",
          description:
            "Retrieves a specific project by ID within an organization. Requires authentication, organization membership with role OWNER or ADMIN, and project membership. Matches `GET /api/v1/organization/:organizationId/projects/:projectId` in `backend/src/routes/project-routes.ts:31` and `backend/src/controllers/project-controller.ts:66` (`getProject`) + `backend/src/middlewares/auth-project-member.ts:5` (`requireProjectMember`). Canonical singular path — alias plural `/organizations` also supported (see below) to prevent 404. Controller fixed at `backend/src/controllers/project-controller.ts:66` to return `Project` (previously only `console.log` and hung).",
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

            401: {
              description: "Authentication token is missing or invalid",
            },

            403: {
              description:
                "User is not a member or does not have permission (requires OWNER or ADMIN + project membership via `requireProjectMember`)",
            },

            404: {
              description: "Project not found",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },

      "/api/v1/organizations/{organizationId}/projects/{projectId}": {
        get: {
          summary: "Get a specific project (alias - plural)",
          description:
            "Alias for `GET /api/v1/organization/{organizationId}/projects/{projectId}` using plural `/organizations`. Kept for backwards compatibility — previously documented as plural and caused 404 when clients used singular. Both paths map to same handler in `backend/src/routes/project-routes.ts:31` and `backend/src/routes/project-routes.ts:40`. Deprecated: use singular `/organization` instead.",
          tags: ["Project"],
          deprecated: true,

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

            401: {
              description: "Authentication token is missing or invalid",
            },

            403: {
              description:
                "User is not a member or does not have permission (requires OWNER or ADMIN + project membership)",
            },

            404: {
              description: "Project not found",
            },

            500: {
              description: "Internal server error",
            },
          },
        },
      },
    },
  },

  // We are defining everything directly in this file.
  apis: [],
});
