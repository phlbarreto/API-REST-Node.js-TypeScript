import { Router } from "express";
import { index } from "~/controller";
import { authentication, register, getUser } from "~/controller/user";
import {
  deleteTask,
  getAllTasks,
  getOneTask,
  insertTask,
  updateTask,
} from "~/controller/task";

import { authenticate } from "~/middleware/authenticate";

const router = Router();

router.get("/", index);

router.post("/login", authentication);
router.post("/user", register);
router.get("/user", getUser);

router.get("/tasks", authenticate, getAllTasks);
router.get("/tasks/:id", authenticate, getOneTask)
router.post("/tasks", authenticate, insertTask);
router.patch("/tasks/:id", authenticate, updateTask);
router.delete("/tasks/:id", authenticate, deleteTask);

export default router;
