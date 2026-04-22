import type { Prisma, Task } from "@prisma/client";

import { prisma } from "../config/prisma";

interface FindManyTasksArgs {
  where: Prisma.TaskWhereInput;
  orderBy: Prisma.TaskOrderByWithRelationInput;
  skip: number;
  take: number;
}

export const taskRepository = {
  create(data: Prisma.TaskUncheckedCreateInput): Promise<Task> {
    return prisma.task.create({ data });
  },

  findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
    });
  },

  findMany(args: FindManyTasksArgs): Promise<Task[]> {
    return prisma.task.findMany({
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
      where: args.where,
    });
  },

  count(where: Prisma.TaskWhereInput): Promise<number> {
    return prisma.task.count({ where });
  },

  update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
    });
  },
};
