import { Router } from "express";
import {
  getAccessToken,
  googleLogin,
  loginUser,
  Register,
} from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import successResponce from "../../common/responce/success.responce.js";
import { validation } from "../../common/middlewares/validation.js";
import { loginSchema, signSchema } from "./auth.validation.js";
import { upload } from "../../common/middlewares/multer.js";

const router = Router();

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

router.get(
  "/login",
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

export default router;
