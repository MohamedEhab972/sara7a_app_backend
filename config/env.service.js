import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("./config/.env") });

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const USER_JWT_SECRET = process.env.USER_JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;
const ADMIN_REFRESH_SECRET = process.env.ADMIN_REFRESH_SECRET;
const USER_REFRESH_SECRET = process.env.USER_REFRESH_SECRET;
const MOOD = process.env.MOOD;
const SALT = process.env.SALT;

export const env = {
  PORT,
  MONGO_URI,
  ADMIN_JWT_SECRET,
  USER_JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  ADMIN_REFRESH_SECRET,
  USER_REFRESH_SECRET,
  MOOD,
  SALT,
};
