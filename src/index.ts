import express from "express";
import router from "./router/router";
import cors from "cors";
import cookieParser from "cookie-parser";
export const app = express();

app.use(cors({ credentials: true }));

app.use(express.json());
app.use(cookieParser());
app.use("/", router);
