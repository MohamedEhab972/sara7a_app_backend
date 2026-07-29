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

export const bootstrap = async () => {
  const app = express();
  app.set("trust proxy", true); // Enable if behind a proxy (e.g., Heroku, Nginx)
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: false,
    }),
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    // store: ... , // Redis, Memcached, etc. See below.
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json({
        status: false,
        message: "Too many requests, please try again later.",
      });
    },
    requestPropertyName: "rateLimit", // Change the property name on `req` where the rate limit info is stored.
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
  app.use("{*dummy}", (req, res) => {
    res.status(404).json({ status: false, message: "Route not found" });
  });
  app.get("/", (req, res) => {
    console.log(req.rateLimit);
    res.status(200).json({ status: true, message: "Server is running" });
  });
  app.use(globalErrorHandler);
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};
