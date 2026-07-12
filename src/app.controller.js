import express from "express";
import { connectDB } from "./database/connection.js";
import authRouter from "./modules/auth/auth.controller.js";
import userRouter from "./modules/user/user.controller.js";
import messageRouter from "./modules/messages/message.controller.js";
import { globalErrorHandler } from "../src/common/responce/error.responce.js";
import { env } from "../config/env.service.js";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import { connectRedis } from "./database/redis.js";

export const bootstrap = async () => {
  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(express.json());
  connectDB();
  connectRedis();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);
  app.use("{*dummy}", (req, res) => {
    res.status(404).json({ status: false, message: "Route not found" });
  });
  app.use(globalErrorHandler);
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};
