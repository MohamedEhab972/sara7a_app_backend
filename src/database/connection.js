import mongoose from "mongoose";
import { env } from "../../config/env.service.js";

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
 