import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { globalRateLimiter } from "./middlewares/rate-limit.middleware";
import { attachRequestId } from "./middlewares/request-id.middleware";
import { sanitizeRequest } from "./middlewares/sanitize.middleware";
import { apiRouter } from "./routes";
import { docsRouter } from "./routes/docs.routes";
import { createHealthPayload } from "./utils/health.util";

export const app = express();

app.set("trust proxy", 1);
app.use(attachRequestId);
app.use(
  cors({
    credentials: true,
    origin: env.CLIENT_URL,
  }),
);
app.use(helmet());
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.JSON_BODY_LIMIT }));
app.use(cookieParser());
app.use(sanitizeRequest);
app.use(
  morgan("combined", {
    stream: {
      write: (message) => {
        logger.http(message.trim());
      },
    },
  }),
);
app.use(globalRateLimiter);

app.get("/health", (_request, response) => {
  response.status(200).json(createHealthPayload());
});

app.use("/docs", docsRouter);
app.use(env.API_PREFIX, apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
