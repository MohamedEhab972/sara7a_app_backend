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

  const hashedPassword = await generateHash(password);
  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
    uniqueAccName,
    profilePicture: imagePath,
    phone,
    otp,
  });

  sendEmail({
    to: user.email,
    subject: "verify your email",
    text: `<h1>verify your email , your otp is ${otp} </h1>`,
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
