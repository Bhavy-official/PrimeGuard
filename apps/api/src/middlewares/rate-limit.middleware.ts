import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env";

const createRateLimitHandler = (options: {
  max: number;
  message: string;
  windowMs: number;
}) => {
  return rateLimit({
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message,
    },
    max: options.max,
    standardHeaders: true,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    windowMs: options.windowMs,
  });
};

export const globalRateLimiter = createRateLimitHandler({
  max: env.API_RATE_LIMIT_MAX,
  message: "Too many requests from this IP. Please try again later.",
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
});

export const authRateLimiter = createRateLimitHandler({
  max: env.AUTH_RATE_LIMIT_MAX,
  message: "Too many authentication attempts. Please try again later.",
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
});
