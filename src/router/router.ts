import { Router } from "express";
import { index } from "../controller";
import { login, register, validate } from "../controller/auth";

const router = Router();

router.get("/", index);

router.post("/register", register);
router.post("/login", login);
router.get("/validate", validate);

// GET /tasks
// POST /tasks
// PUT /tasks/:id
// DELETE /tasks/:id

export default router;
