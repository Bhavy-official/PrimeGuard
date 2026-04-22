-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('USER_REGISTERED', 'USER_LOGGED_IN', 'USER_LOGGED_OUT', 'TOKEN_REFRESHED', 'PROFILE_UPDATED', 'PASSWORD_CHANGED', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'USER_LIST_VIEWED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" UUID NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "tokenHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "replacedById" UUID,
    "userAgent" VARCHAR(255),
    "ipAddress" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "entityType" VARCHAR(100),
    "entityId" UUID,
    "description" TEXT,
    "metadata" JSONB,
    "ipAddress" VARCHAR(64),
    "userAgent" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "taskId" UUID,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_deletedAt_idx" ON "users"("role", "deletedAt");

-- CreateIndex
CREATE INDEX "users_email_deletedAt_idx" ON "users"("email", "deletedAt");

-- CreateIndex
CREATE INDEX "tasks_ownerId_deletedAt_status_createdAt_idx" ON "tasks"("ownerId", "deletedAt", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "tasks_ownerId_priority_deletedAt_idx" ON "tasks"("ownerId", "priority", "deletedAt");

-- CreateIndex
CREATE INDEX "tasks_dueDate_deletedAt_idx" ON "tasks"("dueDate", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_revokedAt_idx" ON "refresh_tokens"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_replacedById_idx" ON "refresh_tokens"("replacedById");

-- CreateIndex
CREATE INDEX "activity_logs_userId_createdAt_idx" ON "activity_logs"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_action_createdAt_idx" ON "activity_logs"("action", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_taskId_createdAt_idx" ON "activity_logs"("taskId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
