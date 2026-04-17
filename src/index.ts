import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "~/router/router.js";
export const app = express();

app.use(cors({ credentials: true }));

app.use(express.json());
app.use(cookieParser());
app.use("/", router);
