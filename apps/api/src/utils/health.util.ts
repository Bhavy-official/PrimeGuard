import { env } from "../config/env";

export const createHealthPayload = () => {
  return {
    data: {
      environment: env.NODE_ENV,
      service: env.APP_NAME,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    message: "API is healthy.",
    success: true,
  };
};
