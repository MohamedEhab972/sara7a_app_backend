import { Router } from "express";
import {
  getAccessToken,
  getUserData,
  loginUser,
  Register,
} from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import successResponce from "../../common/responce/success.responce.js";
import { auth } from "../../common/middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const addedUser = await Register(req.body);
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
  asyncHandler(async (req, res) => {
    const result = await loginUser(req.body, req.get("host"));
    successResponce({ res, message: "Login successful", data: result });
  }),
);

router.get(
  "/get-user-data",
  auth,
  asyncHandler(async (req, res) => {
    const user = await getUserData(req.user.id);
    successResponce({ res, message: "success", data: user });
  }),
);

router.get(
  "/get-access-token",
  asyncHandler(async (req, res) => {
    const accessToken = await getAccessToken(
      req.headers.authorization,
      req.get("host"),
    );
    successResponce({ res, message: "success", accessToken });
  }),
);

export default router;
