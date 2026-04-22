import { z } from "zod";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~-]).{8,64}$/;

export const registerSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(255),
    password: z
      .string()
      .min(8)
      .max(64)
      .regex(
        passwordRegex,
        "Password must include uppercase, lowercase, number, and special character.",
      ),
    firstName: z.string().trim().min(2).max(100),
    lastName: z.string().trim().min(2).max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(255),
    password: z.string().min(8).max(64),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().trim().min(1).optional(),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().trim().min(1).optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["body"];
export type LogoutInput = z.infer<typeof logoutSchema>["body"];
