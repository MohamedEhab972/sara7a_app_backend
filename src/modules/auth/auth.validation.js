import Joi from "joi";

export const signSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  name: Joi.string().required(),
  phone: Joi.string().optional(),
  uniqueAccName: Joi.string().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyResetOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().required(),
});

export const resetPasswordSchema = Joi.object({
  resetToken: Joi.string().required(),
  newPassword: Joi.string().required(),
});
