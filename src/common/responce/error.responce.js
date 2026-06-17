import { env } from "../../../config/env.service.js";

export const errorResponce = ({
  status = 400,
  message = "Somthing went wrong",
  extra = null,
} = {}) => {
  throw new Error(message, { cause: { status, extra } });
};

export const BadRequestException = ({
  message = "Bad request",
  extra = null,
} = {}) => {
  return errorResponce({ status: 400, message, extra });
};

export const NotFoundException = ({
  message = "Not found",
  extra = null,
} = {}) => {
  return errorResponce({ status: 404, message, extra });
};

export const UnauthorizedException = ({
  message = "Unauthorized",
  extra = null,
} = {}) => {
  return errorResponce({ status: 401, message, extra });
};

export const ForbiddenException = ({
  message = "Forbidden",
  extra = null,
} = {}) => {
  return errorResponce({ status: 403, message, extra });
};

export const ConflictException = ({
  message = "Conflict",
  extra = null,
} = {}) => {
  return errorResponce({ status: 409, message, extra });
};

export const globalErrorHandler = (err, req, res, next) => {
  const MOOD = env.MOOD === "dev";
  const defultMessage = "Somthing went wrong";
  const message = err.message || defultMessage;
  const status = err.status ? err.status : err.cause ? err.cause?.status : 500;

  res.status(status).json({
    status: false,
    message: MOOD ? message : defultMessage,
    extra: err.cause?.extra || null,
    stack: MOOD ? err.stack : null,
  });
};
