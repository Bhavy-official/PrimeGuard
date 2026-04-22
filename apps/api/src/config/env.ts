import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  API_PREFIX: z.string().trim().default("/api/v1"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  APP_NAME: z.string().trim().default("PrimeTrade API"),
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters long."),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters long."),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),
  JSON_BODY_LIMIT: z.string().trim().default("1mb"),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");

  throw new Error(`Invalid environment configuration. ${issues}`);
}

export const env = parsedEnv.data;
