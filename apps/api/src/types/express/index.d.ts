import type { Role } from "@prisma/client";
import type { Request } from "express";

export interface AuthUser {
  userId: string;
  role: Role;
}

export interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: AuthUser;
    }
  }
}

export {};
