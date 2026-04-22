import { Role } from "@prisma/client";
import { Router } from "express";

import { userController } from "../controllers/user.controller";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { listUsersSchema, updateProfileSchema } from "../validators/user.validator";

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get("/me", userController.getProfile);
userRouter.patch("/me", validate(updateProfileSchema), userController.updateProfile);
userRouter.get("/", authorizeRoles(Role.ADMIN), validate(listUsersSchema), userController.listUsers);
