import { userModel } from "../../database/models/user.model.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/responce/error.responce.js";
import {
  generateAccessToken,
  generateToken,
} from "../../common/middlewares/auth/auth.js";
import {
  generateHash,
  compareData,
} from "../../common/middlewares/security/encreption.js";
import { env } from "../../../config/env.service.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { OAuth2Client } from "google-auth-library";
import { createRevokeToken, setRedis } from "../../database/redis.service.js";

export const Register = async (data, image) => {
  const { name, password, email, uniqueAccName, phone } = data;
  if (!name || !password || !email || !uniqueAccName) {
    BadRequestException({
      message: "name, password, email and uniqueAccName are required",
    });
  }
  let imagePath = "";
  if (image) {
    imagePath = `${env.SERVER_URI}/${image.path}`;
  }

  const existUser = await userModel.findOne({ email });
  if (existUser) {
    BadRequestException({ message: "User already exists" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await generateHash(otp);
  const hashedPassword = await generateHash(password);
  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
    uniqueAccName,
    profilePicture: imagePath,
    phone,
  });
  await setRedis(`otp:${user._id}`, hashedOtp, 60 * 5);
  sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: `
    <h1>Verify your email</h1>
    <p>Your OTP is: <strong>${otp}</strong></p>
  `,
  });
  return user;
};

export const loginUser = async (data, host) => {
  const { email, password } = data;

  const user = await userModel.findOne({ email, isVerified: true });
  if (!user) {
    NotFoundException({ message: "User not found" });
  }

  const isMatch = await compareData(password, user.password);
  if (!isMatch) {
    UnauthorizedException({ message: "Invalid credentials" });
  }
  const tokens = generateToken(user, host, user.role);
  return { user, tokens };
};

export const getAccessToken = async (token, host) => {
  const [flag, accessToken] = token.split(" ");
  if (flag !== "Bearer") {
    UnauthorizedException({ message: "Unauthorized" });
  }
  const newAccessToken = await generateAccessToken(token, host);

  return newAccessToken;
};

export const googleLogin = async (data, host) => {
  const { credential } = data;
  if (!credential) {
    BadRequestException({ message: "credential is required" });
  }
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  let user = await userModel.findOne({ email: payload.email });

  if (!user) {
    const hashedPassword = await generateHash(payload.sub);
    user = await userModel.create({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      uniqueAccName: payload.email.split("@")[0] + "_" + payload.sub.slice(-6),
      profilePicture: payload.picture,
      isVerified: true,
    });
  } else if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
  }

  const tokens = generateToken(user, host, user.role);
  return { user, tokens };
};

export const logoutUser = async (req) => {
  const revokedToken = await createRevokeToken(req.user.id, req.token);
  await setRedis(revokedToken, 1, req.user.iat + 30 * 60);
  return { message: "Logout successful" };
};
