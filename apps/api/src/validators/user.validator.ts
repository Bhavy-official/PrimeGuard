import { Role } from "@prisma/client";
import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z
    .object({
      firstName: z.string().trim().min(2).max(100).optional(),
      lastName: z.string().trim().min(2).max(100).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field must be provided for update.",
    }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(200).optional(),
    role: z.nativeEnum(Role).optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "email", "firstName", "lastName"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type ListUsersQuery = z.infer<typeof listUsersSchema>["query"];
