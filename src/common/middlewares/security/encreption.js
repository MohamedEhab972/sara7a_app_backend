import { env } from "../../../../config/env.service.js";
import bcrypt from "bcrypt";

export const generateHash = async (data) => {
  let encryptedData = await bcrypt.hash(data, +env.SALT);
  return encryptedData;
};

export const compareData = async (data, encryptedData) => {
  let isMatch = await bcrypt.compare(data, encryptedData);
  return isMatch;
};
