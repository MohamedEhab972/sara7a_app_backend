import { Router } from "express";
import { auth } from "../../common/middlewares/auth.middleware.js";
import successResponce from "../../common/responce/success.responce.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getPublicProfile,
  getUserData,
  updateUserData,
} from "./user.service.js";
import { upload } from "../../common/middlewares/multer.js";

const router = Router();

router.get(
  "/get-user-data",
  auth,
  asyncHandler(async (req, res) => {
    const user = await getUserData(req.user.id);
    successResponce({ res, message: "success", data: user });
  }),
);

router.put(
  "/update-user-data",
  auth,
  upload().single("image"),
  asyncHandler(async (req, res) => {
    const updatedUser = await updateUserData(req.user.id, req.body, req.file);
    successResponce({
      res,
      message: "User data updated successfully",
      data: updatedUser,
    });
  }),
);

router.get(
  "/public/:uniqueAccName",
  asyncHandler(async (req, res) => {
    const user = await getPublicProfile(req.params.uniqueAccName);
    successResponce({ res, message: "success", data: user });
  }),
);

export default router;
