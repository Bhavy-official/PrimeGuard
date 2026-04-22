import type { Request } from "express";

import type { RequestContext } from "../types/express";

export const getRequestContext = (request: Request): RequestContext => ({
  ipAddress: request.ip ?? null,
  requestId: request.id ?? null,
  userAgent:
    typeof request.headers["user-agent"] === "string"
      ? request.headers["user-agent"]
      : null,
});
