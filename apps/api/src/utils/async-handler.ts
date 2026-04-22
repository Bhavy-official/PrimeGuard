import type { NextFunction, Request, Response } from "express";

export const asyncHandler =
  <TRequest extends Request = Request>(
    handler: (
      request: TRequest,
      response: Response,
      next: NextFunction,
    ) => Promise<unknown>,
  ) =>
  (request: Request, response: Response, next: NextFunction): void => {
    const typedRequest = request as TRequest;

    void handler(typedRequest, response, next).catch(next);
  };
