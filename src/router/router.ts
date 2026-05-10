import { Router } from "express";
import { index } from "~/controller/index.js";
import * as userCtrl from "~/controller/user.js";
import * as taskCtrl from "~/controller/task.js";

import { authenticate } from "~/middleware/authenticate.js";

const router = Router();

router.get("/", index);

router.post("/login", userCtrl.login);
router.get("/user", userCtrl.getUser);
router.post("/user", userCtrl.register);
router.delete("/user", userCtrl.logout);

router.get("/tasks", authenticate, taskCtrl.getAllTasks);
router.get("/tasks/:id", authenticate, taskCtrl.getOneTask);
router.post("/tasks", authenticate, taskCtrl.insertTask);
router.patch("/tasks/:id", authenticate, taskCtrl.updateTask);
router.delete("/tasks/:id", authenticate, taskCtrl.deleteTask);

export default router;
