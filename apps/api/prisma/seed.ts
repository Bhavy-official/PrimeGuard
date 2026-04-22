import bcrypt from "bcrypt";
import {
  ActivityAction,
  PrismaClient,
  Role,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {
  const passwordHash = await bcrypt.hash("Admin@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@primetrade.ai" },
    update: {
      deletedAt: null,
      firstName: "Prime",
      isActive: true,
      lastName: "Admin",
      password: passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: "admin@primetrade.ai",
      firstName: "Prime",
      lastName: "Admin",
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@primetrade.ai" },
    update: {
      deletedAt: null,
      firstName: "Demo",
      isActive: true,
      lastName: "User",
      password: passwordHash,
      role: Role.USER,
    },
    create: {
      email: "user@primetrade.ai",
      firstName: "Demo",
      lastName: "User",
      password: passwordHash,
      role: Role.USER,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Review admin dashboard metrics",
        description: "Validate activity trends and user growth figures.",
        ownerId: admin.id,
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
      },
      {
        title: "Prepare onboarding checklist",
        description: "Document first-week workflow for new users.",
        ownerId: user.id,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.activityLog.createMany({
    data: [
      {
        action: ActivityAction.USER_REGISTERED,
        description: "Seeded admin account.",
        entityId: admin.id,
        entityType: "User",
        userId: admin.id,
      },
      {
        action: ActivityAction.USER_REGISTERED,
        description: "Seeded demo user account.",
        entityId: user.id,
        entityType: "User",
        userId: user.id,
      },
    ],
    skipDuplicates: false,
  });
};

void seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
