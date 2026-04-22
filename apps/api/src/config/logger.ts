import path from "node:path";

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

import { env } from "./env";

const logDir = path.resolve(process.cwd(), "logs");

const fileTransport = new DailyRotateFile({
  dirname: logDir,
  filename: "application-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
});

const errorFileTransport = new DailyRotateFile({
  dirname: logDir,
  filename: "error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "30d",
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {
    service: "primetrade-api",
    environment: env.NODE_ENV,
  },
  transports: [
    fileTransport,
    errorFileTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `${timestamp} [${level}] ${stack ?? message}`;
        }),
      ),
    }),
  ],
});
