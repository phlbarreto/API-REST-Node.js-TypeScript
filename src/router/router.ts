import { Router } from "express";
import { index } from "../controller";
import { login, register, validate } from "../controller/auth";
import {
  deleteTask,
  getTasks,
  insertTask,
  updateTask,
} from "../controller/task";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.get("/", index);

router.post("/register", register);
router.post("/login", login);
router.get("/validate", validate);

router.get("/tasks", authenticate, getTasks);
router.post("/tasks", authenticate, insertTask);
router.patch("/tasks/:id", authenticate, updateTask);
router.delete("/tasks/:id", authenticate, deleteTask);

export default router;
