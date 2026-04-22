import { ActivityAction, Prisma, type Role, type User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../config/prisma";
import { userRepository } from "../repositories/user.repository";
import type { AuthUser } from "../types/express";
import { ApiError } from "../utils/api-error";
import type { ListUsersQuery, UpdateProfileInput } from "../validators/user.validator";

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

interface ListUsersResult {
  items: SafeUser[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    role?: Role;
    isActive?: boolean;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
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

const buildUserWhereInput = (query: ListUsersQuery): Prisma.UserWhereInput => {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
  };

  if (query.role) {
    where.role = query.role;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: "insensitive" } },
      { firstName: { contains: query.search, mode: "insensitive" } },
      { lastName: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
};

const buildUserOrderBy = (
  sortBy: ListUsersQuery["sortBy"],
  sortOrder: ListUsersQuery["sortOrder"],
): Prisma.UserOrderByWithRelationInput => {
  if (sortBy === "email") {
    return { email: sortOrder };
  }

  if (sortBy === "firstName") {
    return { firstName: sortOrder };
  }

  if (sortBy === "lastName") {
    return { lastName: sortOrder };
  }

  if (sortBy === "updatedAt") {
    return { updatedAt: sortOrder };
  }

  return { createdAt: sortOrder };
};

export const userService = {
  async getProfile(currentUser: AuthUser): Promise<SafeUser> {
    const user = await userRepository.findById(currentUser.userId);

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User profile not found.");
    }

    return toSafeUser(user);
  },

  async updateProfile(
    input: UpdateProfileInput,
    currentUser: AuthUser,
    context: { ipAddress: string | null; userAgent: string | null; requestId: string | null },
  ): Promise<SafeUser> {
    const existingUser = await userRepository.findById(currentUser.userId);

    if (!existingUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User profile not found.");
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: currentUser.userId },
        data: {
          ...(input.firstName !== undefined ? { firstName: input.firstName.trim() } : {}),
          ...(input.lastName !== undefined ? { lastName: input.lastName.trim() } : {}),
        },
      });

      await tx.activityLog.create({
        data: {
          action: ActivityAction.PROFILE_UPDATED,
          description: "User profile updated successfully.",
          entityId: user.id,
          entityType: "User",
          ipAddress: context.ipAddress ?? undefined,
          metadata: {
            changedFields: Object.keys(input),
            requestId: context.requestId,
          },
          userAgent: context.userAgent ?? undefined,
          userId: user.id,
        },
      });

      return user;
    });

    return toSafeUser(updatedUser);
  },

  async listUsers(
    query: ListUsersQuery,
    currentUser: AuthUser,
    context: { ipAddress: string | null; userAgent: string | null; requestId: string | null },
  ): Promise<ListUsersResult> {
    if (currentUser.role !== "ADMIN") {
      throw new ApiError(StatusCodes.FORBIDDEN, "Only admins can list users.");
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = buildUserWhereInput(query);
    const orderBy = buildUserOrderBy(query.sortBy, query.sortOrder);

    const [users, totalItems] = await Promise.all([
      userRepository.findMany({
        orderBy,
        skip,
        take: limit,
        where,
      }),
      userRepository.count(where),
    ]);

    await prisma.activityLog.create({
      data: {
        action: ActivityAction.USER_LIST_VIEWED,
        description: "Admin viewed the users list.",
        entityId: currentUser.userId,
        entityType: "User",
        ipAddress: context.ipAddress ?? undefined,
        metadata: {
          filters: {
            isActive: query.isActive,
            page,
            role: query.role,
            search: query.search,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
          },
          requestId: context.requestId,
        },
        userAgent: context.userAgent ?? undefined,
        userId: currentUser.userId,
      },
    });

    return {
      filters: {
        ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
        ...(query.role ? { role: query.role } : {}),
        ...(query.search ? { search: query.search } : {}),
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      items: users.map(toSafeUser),
      pagination: {
        limit,
        page,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  },
};
