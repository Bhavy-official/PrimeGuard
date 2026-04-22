import { ActivityAction, Prisma, Role, type User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import ms, { type StringValue } from "ms";

import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { activityLogRepository } from "../repositories/activity-log.repository";
import { refreshTokenRepository } from "../repositories/refresh-token.repository";
import { userRepository } from "../repositories/user.repository";
import type {
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
} from "../validators/auth.validator";
import { ApiError } from "../utils/api-error";
import { hashToken } from "../utils/hash.util";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util";
import { comparePassword, hashPassword } from "../utils/password.util";

interface AuthContext {
  ipAddress: string | null;
  userAgent: string | null;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthResult {
  tokens: AuthTokens;
  user: SafeUser;
}

const refreshTokenLifetimeMs = ms(env.REFRESH_TOKEN_EXPIRES_IN as StringValue);

if (typeof refreshTokenLifetimeMs !== "number") {
  throw new Error("REFRESH_TOKEN_EXPIRES_IN must be a valid duration.");
}

const toSafeUser = (user: User): SafeUser => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createTokenPair = (userId: string, role: Role): AuthTokens => {
  return {
    accessToken: signAccessToken(userId, role),
    refreshToken: signRefreshToken(userId, role),
  };
};

const resolveRefreshToken = (
  payload: RefreshTokenInput | LogoutInput,
  cookieToken?: string,
): string => {
  const token = payload.refreshToken ?? cookieToken;

  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token is required.");
  }

  return token;
};

export const authService = {
  async register(input: RegisterInput, context: AuthContext): Promise<AuthResult> {
    const existingUser = await userRepository.findByEmail(input.email.toLowerCase());

    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, "An account with this email already exists.");
    }

    const passwordHash = await hashPassword(input.password);

    const result = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const createdUser = await transaction.user.create({
        data: {
          email: input.email.toLowerCase(),
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          password: passwordHash,
        },
      });

      const tokens = createTokenPair(createdUser.id, createdUser.role);
      const refreshTokenHash = hashToken(tokens.refreshToken);

      await transaction.refreshToken.create({
        data: {
          expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
          ipAddress: context.ipAddress ?? undefined,
          tokenHash: refreshTokenHash,
          userAgent: context.userAgent ?? undefined,
          userId: createdUser.id,
        },
      });

      await transaction.activityLog.create({
        data: {
          action: ActivityAction.USER_REGISTERED,
          description: "User registered successfully.",
          entityId: createdUser.id,
          entityType: "User",
          ipAddress: context.ipAddress ?? undefined,
          metadata: {
            email: createdUser.email,
            role: createdUser.role,
          },
          userAgent: context.userAgent ?? undefined,
          userId: createdUser.id,
        },
      });

      return {
        tokens,
        user: toSafeUser(createdUser),
      };
    });

    return result;
  },

  async login(input: LoginInput, context: AuthContext): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email.toLowerCase());

    if (!user || user.deletedAt) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
    }

    if (!user.isActive) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Your account has been deactivated.");
    }

    const passwordMatches = await comparePassword(input.password, user.password);

    if (!passwordMatches) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password.");
    }

    const tokens = createTokenPair(user.id, user.role);

    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      await transaction.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await transaction.refreshToken.create({
        data: {
          expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
          ipAddress: context.ipAddress ?? undefined,
          tokenHash: hashToken(tokens.refreshToken),
          userAgent: context.userAgent ?? undefined,
          userId: user.id,
        },
      });

      await transaction.activityLog.create({
        data: {
          action: ActivityAction.USER_LOGGED_IN,
          description: "User logged in successfully.",
          entityId: user.id,
          entityType: "User",
          ipAddress: context.ipAddress ?? undefined,
          metadata: {
            email: user.email,
          },
          userAgent: context.userAgent ?? undefined,
          userId: user.id,
        },
      });
    });

    const freshUser = await userRepository.findById(user.id);

    if (!freshUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User no longer exists.");
    }

    return {
      tokens,
      user: toSafeUser(freshUser),
    };
  },

  async refreshTokens(
    input: RefreshTokenInput,
    context: AuthContext,
    cookieToken?: string,
  ): Promise<AuthResult> {
    const providedToken = resolveRefreshToken(input, cookieToken);
    const payload = verifyRefreshToken(providedToken);

    if (payload.type !== "refresh") {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token.");
    }

    const currentTokenHash = hashToken(providedToken);
    const storedToken = await refreshTokenRepository.findByTokenHash(currentTokenHash);

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token is invalid or expired.");
    }

    if (storedToken.userId !== payload.sub) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token does not match the user.");
    }

    const user = await userRepository.findById(payload.sub);

    if (!user || user.deletedAt || !user.isActive) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User is not allowed to refresh tokens.");
    }

    const newTokens = createTokenPair(user.id, user.role);

    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const createdToken = await transaction.refreshToken.create({
        data: {
          expiresAt: new Date(Date.now() + refreshTokenLifetimeMs),
          ipAddress: context.ipAddress ?? undefined,
          tokenHash: hashToken(newTokens.refreshToken),
          userAgent: context.userAgent ?? undefined,
          userId: user.id,
        },
      });

      await transaction.refreshToken.update({
        where: {
          id: storedToken.id,
        },
        data: {
          replacedById: createdToken.id,
          revokedAt: new Date(),
        },
      });

      await transaction.activityLog.create({
        data: {
          action: ActivityAction.TOKEN_REFRESHED,
          description: "Refresh token rotated successfully.",
          entityId: user.id,
          entityType: "User",
          ipAddress: context.ipAddress ?? undefined,
          metadata: {
            previousTokenId: storedToken.id,
            replacementTokenId: createdToken.id,
          },
          userAgent: context.userAgent ?? undefined,
          userId: user.id,
        },
      });
    });

    return {
      tokens: newTokens,
      user: toSafeUser(user),
    };
  },

  async logout(input: LogoutInput, context: AuthContext, cookieToken?: string): Promise<void> {
    const providedToken = input.refreshToken ?? cookieToken;

    if (!providedToken) {
      return;
    }

    const tokenHash = hashToken(providedToken);

    const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      return;
    }

    await refreshTokenRepository.revokeByTokenHash(tokenHash, new Date());

    await activityLogRepository.create({
      action: ActivityAction.USER_LOGGED_OUT,
      description: "User logged out successfully.",
      entityId: storedToken.userId,
      entityType: "User",
      ipAddress: context.ipAddress,
      metadata: {
        refreshTokenId: storedToken.id,
      },
      userAgent: context.userAgent,
      userId: storedToken.userId,
    });
  },

  getRefreshCookieOptions() {
    return {
      httpOnly: true,
      maxAge: refreshTokenLifetimeMs,
      path: `${env.API_PREFIX}/auth`,
      sameSite: "strict" as const,
      secure: env.NODE_ENV === "production",
    };
  },
};
