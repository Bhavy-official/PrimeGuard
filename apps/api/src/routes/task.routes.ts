import { Router } from "express";

import { taskController } from "../controllers/task.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createTaskSchema,
  deleteTaskSchema,
  getTaskByIdSchema,
  listTasksSchema,
  updateTaskSchema,
} from "../validators/task.validator";

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.post("/", validate(createTaskSchema), taskController.create);
taskRouter.get("/", validate(listTasksSchema), taskController.list);
taskRouter.get("/:taskId", validate(getTaskByIdSchema), taskController.getById);
taskRouter.patch("/:taskId", validate(updateTaskSchema), taskController.update);
taskRouter.delete("/:taskId", validate(deleteTaskSchema), taskController.delete);
