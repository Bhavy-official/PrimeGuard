import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { logger } from "../config/logger";
import { ApiError } from "../utils/api-error";

export const errorHandler = (
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong.";
  let details: unknown;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Validation failed.";
    details = error.flatten();
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Database request failed.";
    details = {
      code: error.code,
      meta: error.meta,
    };
  } else if (error instanceof Error) {
    message = error.message;
  }

  logger.error("Request failed.", {
    details,
    method: request.method,
    path: request.originalUrl,
    requestId: request.id,
    stack: error instanceof Error ? error.stack : undefined,
    statusCode,
  });

  response.status(statusCode).json({
    success: false,
    message,
    ...(request.id ? { meta: { requestId: request.id } } : {}),
    ...(details ? { errors: details } : {}),
  });
};
