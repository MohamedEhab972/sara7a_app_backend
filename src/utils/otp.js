import crypto from "crypto";
import {
  generateHash,
  compareData,
} from "../common/middlewares/security/encreption.js";
import { ConflictException } from "../common/responce/error.responce.js";
import { deleteRedis, getRedis, setRedis } from "../database/redis.service.js";
import { sendEmail } from "./sendEmail.js";

const OTP_TTL_SECONDS = 60 * 5;
const RESET_TOKEN_TTL_SECONDS = 60 * 10;

export const generateAndSendOtp = async (userId, email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await generateHash(otp);
  await setRedis(`otp:${userId}`, hashedOtp, OTP_TTL_SECONDS);
  sendEmail({
    to: email,
    subject: "Verify your email",
    html: `
    <h1>Verify your email</h1>
    <p>Your OTP is: <strong>${otp}</strong></p>
  `,
  });
};

export const verifyOtp = async (userId, otp) => {
  const savedOtp = await getRedis(`otp:${userId}`);
  if (!savedOtp) {
    ConflictException({ message: "OTP expired" });
  }
  const isMatch = await compareData(otp, savedOtp);
  if (!isMatch) {
    ConflictException({ message: "Invalid OTP" });
  }
  await deleteRedis(`otp:${userId}`);
};

export const createResetToken = async (userId) => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  await setRedis(
    `resetToken:${resetToken}`,
    userId.toString(),
    RESET_TOKEN_TTL_SECONDS,
  );
  return resetToken;
};

export const verifyResetToken = async (resetToken) => {
  const userId = await getRedis(`resetToken:${resetToken}`);
  if (!userId) {
    ConflictException({ message: "Reset token expired or invalid" });
  }
  await deleteRedis(`resetToken:${resetToken}`);
  return userId;
};
