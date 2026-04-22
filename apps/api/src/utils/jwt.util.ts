import type { Role } from "@prisma/client";
import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env";

export interface JwtPayload {
  sub: string;
  role: Role;
  type: "access" | "refresh";
}

const signToken = (payload: JwtPayload, secret: string, expiresIn: string): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};

export const signAccessToken = (userId: string, role: Role): string => {
  return signToken(
    { sub: userId, role, type: "access" },
    env.ACCESS_TOKEN_SECRET,
    env.ACCESS_TOKEN_EXPIRES_IN,
  );
};

export const signRefreshToken = (userId: string, role: Role): string => {
  return signToken(
    { sub: userId, role, type: "refresh" },
    env.REFRESH_TOKEN_SECRET,
    env.REFRESH_TOKEN_EXPIRES_IN,
  );
};

const verifyToken = (token: string, secret: string): JwtPayload => {
  const decoded = jwt.verify(token, secret);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload.");
  }

  return decoded as JwtPayload;
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return verifyToken(token, env.ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return verifyToken(token, env.REFRESH_TOKEN_SECRET);
};
