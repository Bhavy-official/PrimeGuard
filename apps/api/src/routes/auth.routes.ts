import { Router } from "express";

import { authController } from "../controllers/auth.controller";
import { authRateLimiter } from "../middlewares/rate-limit.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
} from "../validators/auth.validator";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, validate(registerSchema), authController.register);
authRouter.post("/login", authRateLimiter, validate(loginSchema), authController.login);
authRouter.post("/refresh", authRateLimiter, validate(refreshTokenSchema), authController.refresh);
authRouter.post("/logout", validate(logoutSchema), authController.logout);
