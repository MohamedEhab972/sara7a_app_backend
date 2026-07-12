import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters"],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    coverImage: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    uniqueAccName: {
      type: String,
      unique: true,
      required: true,
    },
    role: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["system", "google"],
      default: "system",
    },
  },
  { timestamps: true },
);

export const userModel = mongoose.model("User", userSchema);
