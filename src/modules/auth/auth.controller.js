import { Router } from "express";
import {
  forgotPassword,
  getAccessToken,
  googleLogin,
  loginUser,
  logoutUser,
  Register,
  resetPassword,
  verifyResetOtp,
} from "./auth.service.js";
import { verifyAccount } from "../user/user.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import successResponce from "../../common/responce/success.responce.js";
import { validation } from "../../common/middlewares/validation.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signSchema,
  verifyResetOtpSchema,
} from "./auth.validation.js";
import { upload } from "../../common/middlewares/multer.js";
import { auth } from "../../common/middlewares/auth.middleware.js";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => `login-${ipKeyGenerator(req.ip, 56)}`,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      status: false,
      message: "Too many login attempts, please try again after a minute.",
    });
  },
});

router.post(
  "/register",
  validation(signSchema),
  upload().single("image"),
  asyncHandler(async (req, res) => {
    const addedUser = await Register(req.body, req.file);
    successResponce({
      res,
      message: "User created successfully",
      status: 201,
      data: addedUser,
    });
  }),
);

router.post(
  "/login",
  loginLimiter,
  validation(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await loginUser(req.body, req.get("host"));
    successResponce({ res, message: "Login successful", data: result });
  }),
);

router.get(
  "/get-access-token",
  asyncHandler(async (req, res) => {
    const accessToken = await getAccessToken(
      req.headers.authorization,
      req.get("host"),
    );
    successResponce({ res, message: "success", data: { accessToken } });
  }),
);

router.post(
  "/google-login",
  asyncHandler(async (req, res) => {
    const result = await googleLogin(req.body, req.get("host"));
    successResponce({ res, message: "Login successful", data: result });
  }),
);

router.patch(
  "/verify-account",
  asyncHandler(async (req, res) => {
    const user = await verifyAccount(req.body);
    successResponce({
      res,
      message: "Account verified successfully",
      data: user,
    });
  }),
);

router.get(
  "/logout",
  auth,
  asyncHandler(async (req, res) => {
    const data = await logoutUser(req);
    successResponce({ res, message: "Logout successful", data });
  }),
);

router.post(
  "/forgot-password",
  validation(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const { message } = await forgotPassword(req);
    successResponce({ res, message });
  }),
);

router.post(
  "/verify-reset-otp",
  validation(verifyResetOtpSchema),
  asyncHandler(async (req, res) => {
    const data = await verifyResetOtp(req.body);
    successResponce({ res, message: "OTP verified", data });
  }),
);

router.post(
  "/reset-password",
  validation(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { message } = await resetPassword(req.body);
    successResponce({ res, message });
  }),
);

export default router;
