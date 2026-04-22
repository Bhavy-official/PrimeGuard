import { Role } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";

import { userRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/api-error";
import { verifyAccessToken } from "../utils/jwt.util";

const extractBearerToken = (request: Request): string => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authorization header is missing.");
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authorization header is malformed.");
  }

  return token;
};

export const authenticate = async (
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractBearerToken(request);
    const payload = verifyAccessToken(token);

    if (payload.type !== "access") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access token.");
    }

    const user = await userRepository.findById(payload.sub);

    if (!user || user.deletedAt || !user.isActive) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User is not authorized.");
    }

    request.user = {
      role: user.role,
      userId: user.id,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles =
  (...roles: Role[]) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.user) {
      next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentication is required."));
      return;
    }

    if (!roles.includes(request.user.role)) {
      next(new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to access this."));
      return;
    }

    next();
  };
