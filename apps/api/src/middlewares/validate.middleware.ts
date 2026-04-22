import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

const setRequestProperty = <T extends keyof Request>(
  request: Request,
  key: T,
  value: Request[T],
): void => {
  Object.defineProperty(request, key, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  });
};

export const validate =
  (schema: ZodSchema) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.parse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    setRequestProperty(request, "body", result.body as Request["body"]);
    setRequestProperty(
      request,
      "params",
      (result.params ?? request.params) as Request["params"],
    );
    setRequestProperty(
      request,
      "query",
      (result.query ?? request.query) as Request["query"],
    );

    next();
  };
