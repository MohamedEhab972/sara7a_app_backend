import express from "express";
import { connectDB } from "./database/connection.js";
import authRouter from "./modules/auth/auth.controller.js";
import bookingRouter from "./modules/booking/booking.controller.js";
import { globalErrorHandler } from "../src/common/responce/error.responce.js";
import { env } from "../config/env.service.js";
import successResponce from "./common/responce/success.responce.js";

export const bootstrap = async () => {
  const app = express();
  app.use(express.json());
  connectDB();
  app.use("/auth", authRouter);
  app.use("/api/bookings", bookingRouter);

  app.use("/test", (req, res) => {
    successResponce({ res, message: "test", status: 200, data: null });
  });
  app.use("{*dummy}", (req, res) => {
    res.status(404).json({ status: false, message: "Route not found" });
  });
  app.use(globalErrorHandler);
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};
