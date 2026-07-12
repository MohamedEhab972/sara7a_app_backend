import { env } from "../../../config/env.service.js";
import {
  compareData,
  generateHash,
} from "../../common/middlewares/security/encreption.js";
import {
  ConflictException,
  NotFoundException,
} from "../../common/responce/error.responce.js";
import { userModel } from "../../database/models/user.model.js";
import { deleteRedis, getRedis } from "../../database/redis.service.js";

export const getUserData = async (id) => {
  const user = await userModel.findById(id);
  if (!user) {
    NotFoundException({ message: "User not found" });
  }
  return user;
};

export const updateUserData = async (id, data, image) => {
  const { name, email, password, uniqueAccName, newPassword } = data;
  let user = await userModel.findById(id);
  if (!user) {
    NotFoundException({ message: "User not found" });
  }
  let existUser = await userModel.findOne({ uniqueAccName });

  if (existUser) {
    ConflictException({ message: "uniqueAccName already exists" });
  }

  const updateFields = {};
  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (uniqueAccName) updateFields.uniqueAccName = uniqueAccName;

  if (image) {
    updateFields.profilePicture = `${env.SERVER_URI}/${image.path}`;
  }

  if (password) {
    const comperedPassword = await compareData(password, user.password);
    if (!comperedPassword) {
      ConflictException({ message: "Invalid credentials" });
    }
    updateFields.password = await generateHash(newPassword);
  }

  const updatedUser = await userModel.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { returnDocument: "after" },
  );
  if (!updatedUser) {
    ConflictException({ message: "Failed to update user" });
  }
  return updatedUser;
};

export const verifyAccount = async (data) => {
  const { email, otp } = data;
  const user = await userModel.findOne({ email });
  if (!user) {
    NotFoundException({ message: "User not found" });
  }
  if (user.isVerified) {
    ConflictException({ message: "User already verified" });
  }
  const savedOtp = await getRedis(`otp:${user._id}`);
  if (!savedOtp) {
    ConflictException({ message: "OTP expired" });
  }
  const isMatch = await compareData(otp, savedOtp);
  if (!isMatch) {
    ConflictException({ message: "Invalid OTP" });
  }
  user.isVerified = true;
  await user.save();
  await deleteRedis(`otp:${user._id}`);
  return user;
};

export const getPublicProfile = async (uniqueAccName) => {
  const user = await userModel
    .findOne({ uniqueAccName })
    .select("_id name uniqueAccName profilePicture");
  if (!user) {
    NotFoundException({ message: "User not found" });
  }
  return user;
};
