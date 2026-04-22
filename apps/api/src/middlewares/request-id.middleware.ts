import type { NextFunction, Request, Response } from "express";

import { createRequestId } from "../utils/request-id.util";

const requestIdHeader = "x-request-id";

export const attachRequestId = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const incomingRequestId = request.headers[requestIdHeader];
  const requestId =
    typeof incomingRequestId === "string" && incomingRequestId.trim().length > 0
      ? incomingRequestId
      : createRequestId();

  request.id = requestId;
  response.setHeader(requestIdHeader, requestId);

  next();
};
