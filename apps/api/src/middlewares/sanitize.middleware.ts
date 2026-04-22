import type { NextFunction, Request, Response } from "express";

import { sanitizeValue } from "../utils/sanitize.util";

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

export const sanitizeRequest = (
  request: Request,
  _response: Response,
  next: NextFunction,
): void => {
  setRequestProperty(request, "body", sanitizeValue(request.body) as Request["body"]);
  setRequestProperty(request, "query", sanitizeValue(request.query) as Request["query"]);
  setRequestProperty(request, "params", sanitizeValue(request.params) as Request["params"]);

  next();
};
