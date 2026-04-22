import type { ActivityAction, Prisma } from "@prisma/client";

import { prisma } from "../config/prisma";

interface CreateActivityLogInput {
  action: ActivityAction;
  userId: string;
  entityType?: string;
  entityId?: string;
  description?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
  taskId?: string;
}

export const activityLogRepository = {
  create(input: CreateActivityLogInput) {
    return prisma.activityLog.create({
      data: {
        action: input.action,
        description: input.description,
        entityId: input.entityId,
        entityType: input.entityType,
        ipAddress: input.ipAddress ?? undefined,
        metadata: input.metadata,
        taskId: input.taskId,
        userAgent: input.userAgent ?? undefined,
        userId: input.userId,
      },
    });
  },
};
