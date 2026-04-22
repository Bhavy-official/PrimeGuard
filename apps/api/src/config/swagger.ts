import swaggerJsdoc from "swagger-jsdoc";

import { env } from "./env";

const openApiDefinition = {
  openapi: "3.0.3",
  info: {
    title: `${env.APP_NAME} Documentation`,
    version: "1.0.0",
    description:
      "REST API for authentication, role-based access control, user profile management, and task management.",
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health", description: "Health and readiness endpoints" },
    { name: "Auth", description: "Authentication and token lifecycle" },
    { name: "Users", description: "User profile and admin user management" },
    { name: "Tasks", description: "Task CRUD operations" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed." },
          meta: {
            type: "object",
            properties: {
              requestId: { type: "string", example: "c9af5a09-5e10-4ef3-9a86-ef8f21193ec8" },
            },
          },
          errors: {
            type: "object",
            additionalProperties: true,
          },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          firstName: { type: "string", example: "Ava" },
          lastName: { type: "string", example: "Sharma" },
          role: { type: "string", enum: ["USER", "ADMIN"] },
          isActive: { type: "boolean", example: true },
          lastLoginAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Prepare quarterly report" },
          description: { type: "string", nullable: true, example: "Compile dashboard data." },
          status: { type: "string", enum: ["TODO", "IN_PROGRESS", "COMPLETED"] },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
          deletedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          ownerId: { type: "string", format: "uuid" },
        },
      },
      MetaRequestId: {
        type: "object",
        properties: {
          requestId: { type: "string", example: "c9af5a09-5e10-4ef3-9a86-ef8f21193ec8" },
        },
      },
      AuthSuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Login successful." },
          data: {
            type: "object",
            properties: {
              accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
              user: { $ref: "#/components/schemas/AuthUser" },
            },
          },
          meta: { $ref: "#/components/schemas/MetaRequestId" },
        },
      },
      UserListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Users fetched successfully." },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/AuthUser" },
          },
          meta: {
            type: "object",
            properties: {
              requestId: { type: "string" },
              filters: { type: "object", additionalProperties: true },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "integer", example: 1 },
                  limit: { type: "integer", example: 10 },
                  totalItems: { type: "integer", example: 42 },
                  totalPages: { type: "integer", example: 5 },
                },
              },
            },
          },
        },
      },
      TaskListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Tasks fetched successfully." },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Task" },
          },
          meta: {
            type: "object",
            properties: {
              requestId: { type: "string" },
              filters: { type: "object", additionalProperties: true },
              pagination: {
                type: "object",
                properties: {
                  page: { type: "integer", example: 1 },
                  limit: { type: "integer", example: 10 },
                  totalItems: { type: "integer", example: 24 },
                  totalPages: { type: "integer", example: 3 },
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "API is healthy.",
                  data: {
                    service: "PrimeGuard API",
                    environment: "development",
                    timestamp: "2026-04-21T12:00:00.000Z",
                    uptime: 240.21,
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${env.API_PREFIX}/auth/register`]: {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "ava@example.com",
                password: "SecurePass123!",
                firstName: "Ava",
                lastName: "Sharma",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
              },
            },
          },
          "409": {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    [`${env.API_PREFIX}/auth/login`]: {
      post: {
        tags: ["Auth"],
        summary: "Login a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "ava@example.com",
                password: "SecurePass123!",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
              },
            },
          },
        },
      },
    },
    [`${env.API_PREFIX}/auth/refresh`]: {
      post: {
        tags: ["Auth"],
        summary: "Rotate refresh token and issue a new access token",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              example: {
                refreshToken: "optional-when-cookie-is-present",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Token refreshed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
              },
            },
          },
        },
      },
    },
    [`${env.API_PREFIX}/auth/logout`]: {
      post: {
        tags: ["Auth"],
        summary: "Logout a user and revoke the refresh token",
        responses: {
          "200": {
            description: "Logout completed",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Logout successful.",
                  meta: {
                    requestId: "c9af5a09-5e10-4ef3-9a86-ef8f21193ec8",
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${env.API_PREFIX}/users/me`]: {
      get: {
        tags: ["Users"],
        summary: "Get the authenticated user's profile",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Profile fetched",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Profile fetched successfully.",
                  data: {
                    id: "f3ad4377-c4b7-4bc2-8c61-b4bf22ce5377",
                    email: "ava@example.com",
                    firstName: "Ava",
                    lastName: "Sharma",
                    role: "USER",
                    isActive: true,
                    lastLoginAt: "2026-04-21T12:00:00.000Z",
                    createdAt: "2026-04-20T11:00:00.000Z",
                    updatedAt: "2026-04-21T12:00:00.000Z",
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update the authenticated user's profile",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                firstName: "Ava",
                lastName: "S.",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Profile updated successfully.",
                  data: {
                    id: "f3ad4377-c4b7-4bc2-8c61-b4bf22ce5377",
                    email: "ava@example.com",
                    firstName: "Ava",
                    lastName: "S.",
                    role: "USER",
                    isActive: true,
                    lastLoginAt: "2026-04-21T12:00:00.000Z",
                    createdAt: "2026-04-20T11:00:00.000Z",
                    updatedAt: "2026-04-21T12:30:00.000Z",
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${env.API_PREFIX}/users`]: {
      get: {
        tags: ["Users"],
        summary: "List users",
        description: "Admin-only endpoint.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 10 } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "role", schema: { type: "string", enum: ["USER", "ADMIN"] } },
          { in: "query", name: "isActive", schema: { type: "boolean" } },
          {
            in: "query",
            name: "sortBy",
            schema: { type: "string", enum: ["createdAt", "updatedAt", "email", "firstName", "lastName"] },
          },
          { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: {
          "200": {
            description: "Users fetched",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserListResponse" },
              },
            },
          },
        },
      },
    },
    [`${env.API_PREFIX}/tasks`]: {
      get: {
        tags: ["Tasks"],
        summary: "List tasks",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 10 } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "status", schema: { type: "string", enum: ["TODO", "IN_PROGRESS", "COMPLETED"] } },
          { in: "query", name: "priority", schema: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] } },
          { in: "query", name: "sortBy", schema: { type: "string", enum: ["createdAt", "updatedAt", "dueDate", "priority", "status", "title"] } },
          { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"] } },
          { in: "query", name: "ownerId", schema: { type: "string", format: "uuid" }, description: "Admin only filter" },
        ],
        responses: {
          "200": {
            description: "Tasks fetched",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskListResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                title: "Prepare quarterly report",
                description: "Compile revenue and profit metrics.",
                priority: "HIGH",
                status: "TODO",
                dueDate: "2026-04-30T18:00:00.000Z",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Task created",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Task created successfully.",
                },
              },
            },
          },
        },
      },
    },
    [`${env.API_PREFIX}/tasks/{taskId}`]: {
      get: {
        tags: ["Tasks"],
        summary: "Get a task by id",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "taskId", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Task fetched",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Task fetched successfully.",
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Tasks"],
        summary: "Update a task",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "taskId", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                status: "IN_PROGRESS",
                priority: "MEDIUM",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Task updated",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Task updated successfully.",
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Soft delete a task",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "taskId", required: true, schema: { type: "string", format: "uuid" } },
        ],
        responses: {
          "200": {
            description: "Task deleted",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Task deleted successfully.",
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const swaggerSpec = swaggerJsdoc({
  definition: openApiDefinition,
  apis: [],
});
