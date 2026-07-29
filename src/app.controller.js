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
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};

export const bootstrap = async () => {
  const app = express();
  app.set("trust proxy", true);

  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    next();
  });

  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,
    skip: (req) => req.method === "OPTIONS",
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json({
        status: false,
        message: "Too many requests, please try again later.",
      });
    },
    requestPropertyName: "rateLimit",
    keyGenerator: (req, res) => {
      const ip = ipKeyGenerator(req.ip, 56);
      return `${ip}-${req.path}`;
    },
  });

  app.use(limiter);
  app.use(express.json());
  await connectDB();
  await connectRedis();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);
  app.get("/", (req, res) => {
    console.log(req.rateLimit);
    res.status(200).json({ status: true, message: "Server is running" });
  });
  app.use((req, res) => {
    res.status(404).json({ status: false, message: "Route not found" });
  });
  app.use(globalErrorHandler);
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};
