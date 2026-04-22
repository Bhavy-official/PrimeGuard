import type { Prisma, User } from "@prisma/client";

import { prisma } from "../config/prisma";

export const userRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  },

  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  updateLastLogin(id: string, date: Date): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: date },
    });
  },

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  findMany(args: {
    skip: number;
    take: number;
    where: Prisma.UserWhereInput;
    orderBy: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
      where: args.where,
    });
  },

  count(where: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where });
  },
};
