import { Router } from "express";

import { authRouter } from "./auth.routes";
import { taskRouter } from "./task.routes";
import { userRouter } from "./user.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/tasks", taskRouter);
apiRouter.use("/users", userRouter);
