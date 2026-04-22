import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";

export const notFoundHandler = (request: Request, response: Response): void => {
  response.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route ${request.originalUrl} not found.`,
  });
};
