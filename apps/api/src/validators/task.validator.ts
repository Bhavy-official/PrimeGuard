import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";

const objectIdSchema = z.string().uuid();

const titleSchema = z.string().trim().min(2).max(200);
const descriptionSchema = z.string().trim().min(1).max(5000);

export const createTaskSchema = z.object({
  body: z.object({
    title: titleSchema,
    description: descriptionSchema.optional(),
    dueDate: z.coerce.date().optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z
    .object({
      title: titleSchema.optional(),
      description: descriptionSchema.nullable().optional(),
      dueDate: z.coerce.date().nullable().optional(),
      priority: z.nativeEnum(TaskPriority).optional(),
      status: z.nativeEnum(TaskStatus).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field must be provided for update.",
    }),
  params: z.object({
    taskId: objectIdSchema,
  }),
});

export const getTaskByIdSchema = z.object({
  params: z.object({
    taskId: objectIdSchema,
  }),
});

export const deleteTaskSchema = getTaskByIdSchema;

export const listTasksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(200).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    sortBy: z
      .enum(["createdAt", "updatedAt", "dueDate", "priority", "status", "title"])
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    ownerId: z.string().uuid().optional(),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>["body"];
export type ListTasksQuery = z.infer<typeof listTasksSchema>["query"];
