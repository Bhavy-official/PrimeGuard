import {
  ActivityAction,
  Prisma,
  Role,
  TaskPriority,
  TaskStatus,
  type Task,
} from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../config/prisma";
import { taskRepository } from "../repositories/task.repository";
import type { AuthUser } from "../types/express";
import { ApiError } from "../utils/api-error";
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
} from "../validators/task.validator";

interface ListTasksResult {
  items: Task[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  filters: {
    ownerId?: string;
    priority?: TaskPriority;
    search?: string;
    status?: TaskStatus;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

const assertTaskAccess = (task: Task | null, currentUser: AuthUser): Task => {
  if (!task || task.deletedAt) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Task not found.");
  }

  if (currentUser.role !== Role.ADMIN && task.ownerId !== currentUser.userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You do not have access to this task.");
  }

  return task;
};

const buildTaskWhereInput = (
  query: ListTasksQuery,
  currentUser: AuthUser,
): Prisma.TaskWhereInput => {
  const where: Prisma.TaskWhereInput = {
    deletedAt: null,
  };

  if (currentUser.role === Role.ADMIN) {
    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }
  } else {
    where.ownerId = currentUser.userId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.search) {
    where.OR = [
      {
        title: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
};

const buildTaskOrderBy = (
  sortBy: ListTasksQuery["sortBy"],
  sortOrder: ListTasksQuery["sortOrder"],
): Prisma.TaskOrderByWithRelationInput => {
  if (sortBy === "priority") {
    return { priority: sortOrder };
  }

  if (sortBy === "status") {
    return { status: sortOrder };
  }

  if (sortBy === "title") {
    return { title: sortOrder };
  }

  if (sortBy === "dueDate") {
    return { dueDate: sortOrder };
  }

  if (sortBy === "updatedAt") {
    return { updatedAt: sortOrder };
  }

  return { createdAt: sortOrder };
};

const createTaskActivityLog = (
  tx: Prisma.TransactionClient,
  input: {
    action: ActivityAction;
    userId: string;
    taskId: string;
    description: string;
    metadata?: Prisma.InputJsonValue;
    ipAddress: string | null;
    userAgent: string | null;
  },
) => {
  return tx.activityLog.create({
    data: {
      action: input.action,
      description: input.description,
      entityId: input.taskId,
      entityType: "Task",
      ipAddress: input.ipAddress ?? undefined,
      metadata: input.metadata,
      taskId: input.taskId,
      userAgent: input.userAgent ?? undefined,
      userId: input.userId,
    },
  });
};

export const taskService = {
  async createTask(
    input: CreateTaskInput,
    currentUser: AuthUser,
    context: { ipAddress: string | null; userAgent: string | null },
  ): Promise<Task> {
    const createdTask = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          description: input.description,
          dueDate: input.dueDate,
          ownerId: currentUser.userId,
          priority: input.priority ?? TaskPriority.MEDIUM,
          status: input.status ?? TaskStatus.TODO,
          title: input.title.trim(),
        },
      });

      await createTaskActivityLog(tx, {
        action: ActivityAction.TASK_CREATED,
        description: "Task created successfully.",
        ipAddress: context.ipAddress,
        metadata: {
          priority: task.priority,
          status: task.status,
          title: task.title,
        },
        taskId: task.id,
        userAgent: context.userAgent,
        userId: currentUser.userId,
      });

      return task;
    });

    return createdTask;
  },

  async listTasks(query: ListTasksQuery, currentUser: AuthUser): Promise<ListTasksResult> {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = buildTaskWhereInput(query, currentUser);
    const orderBy = buildTaskOrderBy(query.sortBy, query.sortOrder);

    const [items, totalItems] = await prisma.$transaction([
      prisma.task.findMany({
        orderBy,
        skip,
        take: limit,
        where,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      filters: {
        ...(currentUser.role === Role.ADMIN && query.ownerId ? { ownerId: query.ownerId } : {}),
        ...(query.priority ? { priority: query.priority } : {}),
        ...(query.search ? { search: query.search } : {}),
        ...(query.status ? { status: query.status } : {}),
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      items,
      pagination: {
        limit,
        page,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
      },
    };
  },

  async getTaskById(taskId: string, currentUser: AuthUser): Promise<Task> {
    const task = await taskRepository.findById(taskId);

    return assertTaskAccess(task, currentUser);
  },

  async updateTask(
    taskId: string,
    input: UpdateTaskInput,
    currentUser: AuthUser,
    context: { ipAddress: string | null; userAgent: string | null },
  ): Promise<Task> {
    const task = await taskRepository.findById(taskId);

    const existingTask = assertTaskAccess(task, currentUser);

    return prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: existingTask.id },
        data: {
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
          ...(input.priority !== undefined ? { priority: input.priority } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
          ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        },
      });

      await createTaskActivityLog(tx, {
        action: ActivityAction.TASK_UPDATED,
        description: "Task updated successfully.",
        ipAddress: context.ipAddress,
        metadata: {
          changedFields: Object.keys(input),
        },
        taskId: updatedTask.id,
        userAgent: context.userAgent,
        userId: currentUser.userId,
      });

      return updatedTask;
    });
  },

  async deleteTask(
    taskId: string,
    currentUser: AuthUser,
    context: { ipAddress: string | null; userAgent: string | null },
  ): Promise<void> {
    const task = await taskRepository.findById(taskId);

    const existingTask = assertTaskAccess(task, currentUser);

    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: existingTask.id },
        data: {
          deletedAt: new Date(),
        },
      });

      await createTaskActivityLog(tx, {
        action: ActivityAction.TASK_DELETED,
        description: "Task soft deleted successfully.",
        ipAddress: context.ipAddress,
        metadata: {
          title: existingTask.title,
        },
        taskId: existingTask.id,
        userAgent: context.userAgent,
        userId: currentUser.userId,
      });
    });
  },
};
