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

export const Register = async (data) => {
  const { name, password, email, uniqueAccName } = data;
  if (!name || !password || !email || !uniqueAccName) {
    BadRequestException({
      message: "name, password, email and uniqueAccName are required",
    });
  }

  const existUser = await userModel.findOne({ email });
  if (existUser) {
    BadRequestException({ message: "User already exists" });
  }

  const hashedPassword = await generateHash(password);
  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
    uniqueAccName,
  });
  return user;
};

export const loginUser = async (data, host) => {
  const { email, password } = data;
  const user = await userModel.findOne({ email });
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

export const getUserData = async (id) => {
  const user = await userModel.findById(id);
  if (!user) {
    NotFoundException({ message: "User not found" });
  }
  return user;
};

export const getAccessToken = async (token, host) => {
  const [flag, accessToken] = token.split(" ");
  if (flag !== "Bearer") {
    UnauthorizedException({ message: "Unauthorized" });
  }
  const newAccessToken = await generateAccessToken(token, host);

  return newAccessToken;
};
