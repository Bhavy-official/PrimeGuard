import { StatusCodes } from "http-status-codes";
import type { Response } from "express";

import type { AuthenticatedRequest } from "../types/express";
import { taskService } from "../services/task.service";
import { ApiError } from "../utils/api-error";
import { createApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { getRequestContext } from "../utils/request-metadata.util";
import type { ListTasksQuery } from "../validators/task.validator";

const getAuthenticatedUser = (request: AuthenticatedRequest) => {
  if (!request.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication is required.");
  }

  return request.user;
};

const getRouteParam = (value: string | string[] | undefined, fieldName: string): string => {
  if (typeof value !== "string") {
    throw new ApiError(StatusCodes.BAD_REQUEST, `${fieldName} must be a valid string.`);
  }

  return value;
};

export const taskController = {
  create: asyncHandler(async (request: AuthenticatedRequest, response: Response) => {
    const task = await taskService.createTask(
      request.body,
      getAuthenticatedUser(request),
      getRequestContext(request),
    );

    response
      .status(StatusCodes.CREATED)
      .json(
        createApiResponse(
          "Task created successfully.",
          task,
          request.id ? { requestId: request.id } : undefined,
        ),
      );
  }),

  list: asyncHandler(async (request: AuthenticatedRequest, response: Response) => {
    const result = await taskService.listTasks(
      request.query as unknown as ListTasksQuery,
      getAuthenticatedUser(request),
    );

    response.status(StatusCodes.OK).json(
      createApiResponse("Tasks fetched successfully.", result.items, {
        filters: result.filters,
        pagination: result.pagination,
        ...(request.id ? { requestId: request.id } : {}),
      }),
    );
  }),

  getById: asyncHandler(async (request: AuthenticatedRequest, response: Response) => {
    const task = await taskService.getTaskById(
      getRouteParam(request.params.taskId, "taskId"),
      getAuthenticatedUser(request),
    );

    response.status(StatusCodes.OK).json(
      createApiResponse(
        "Task fetched successfully.",
        task,
        request.id ? { requestId: request.id } : undefined,
      ),
    );
  }),

  update: asyncHandler(async (request: AuthenticatedRequest, response: Response) => {
    const task = await taskService.updateTask(
      getRouteParam(request.params.taskId, "taskId"),
      request.body,
      getAuthenticatedUser(request),
      getRequestContext(request),
    );

    response.status(StatusCodes.OK).json(
      createApiResponse(
        "Task updated successfully.",
        task,
        request.id ? { requestId: request.id } : undefined,
      ),
    );
  }),

  delete: asyncHandler(async (request: AuthenticatedRequest, response: Response) => {
    await taskService.deleteTask(
      getRouteParam(request.params.taskId, "taskId"),
      getAuthenticatedUser(request),
      getRequestContext(request),
    );

    response.status(StatusCodes.OK).json(
      createApiResponse(
        "Task deleted successfully.",
        undefined,
        request.id ? { requestId: request.id } : undefined,
      ),
    );
  }),
};
