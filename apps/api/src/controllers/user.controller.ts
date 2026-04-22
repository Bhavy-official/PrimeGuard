import { StatusCodes } from "http-status-codes";
import type { Response } from "express";

import { userService } from "../services/user.service";
import type { AuthenticatedRequest } from "../types/express";
import { ApiError } from "../utils/api-error";
import { createApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { getRequestContext } from "../utils/request-metadata.util";
import type { ListUsersQuery } from "../validators/user.validator";

const getAuthenticatedUser = (request: AuthenticatedRequest) => {
  if (!request.user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication is required.");
  }

  return request.user;
};

export const userController = {
  getProfile: asyncHandler(async (request: AuthenticatedRequest, response: Response) => {
    const user = await userService.getProfile(getAuthenticatedUser(request));

    response.status(StatusCodes.OK).json(
      createApiResponse(
        "Profile fetched successfully.",
        user,
        request.id ? { requestId: request.id } : undefined,
      ),
    );
  }),

  updateProfile: asyncHandler(async (request: AuthenticatedRequest, response: Response) => {
    const user = await userService.updateProfile(
      request.body,
      getAuthenticatedUser(request),
      getRequestContext(request),
    );

    response.status(StatusCodes.OK).json(
      createApiResponse(
        "Profile updated successfully.",
        user,
        request.id ? { requestId: request.id } : undefined,
      ),
    );
  }),

  listUsers: asyncHandler(async (request: AuthenticatedRequest, response: Response) => {
    const result = await userService.listUsers(
      request.query as unknown as ListUsersQuery,
      getAuthenticatedUser(request),
      getRequestContext(request),
    );

    response.status(StatusCodes.OK).json(
      createApiResponse("Users fetched successfully.", result.items, {
        filters: result.filters,
        pagination: result.pagination,
        ...(request.id ? { requestId: request.id } : {}),
      }),
    );
  }),
};
