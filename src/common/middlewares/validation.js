import { asyncHandler } from "../../utils/asyncHandler.js";
import { BadRequestException } from "../responce/error.responce.js";

export const validation = (schema) =>
  asyncHandler((req, res, next) => {
    const { value, error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      BadRequestException({ message: "Invalid credentials", extra: error });
    }
    next();
  });
