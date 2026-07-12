import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import successResponce from "../../common/responce/success.responce.js";
import { upload } from "../../common/middlewares/multer.js";
import { deleteMessage, getMessages, sendMessage } from "./message.service.js";
import { auth, optionalAuth } from "../../common/middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/send-message",
  optionalAuth,
  upload().single("image"),
  asyncHandler(async (req, res) => {
    const result = await sendMessage(req.body, req.file, req.user?.id);
    successResponce({
      res,
      message: "Message sent successfully",
      data: result,
    });
  }),
);

router.get(
  "/get-messages",
  auth,
  asyncHandler(async (req, res) => {
    const messages = await getMessages(req.user.id);
    successResponce({
      res,
      message: "Messages retrieved successfully",
      data: messages,
    });
  }),
);

router.delete(
  "/delete-message/:id",
  auth,
  asyncHandler(async (req, res) => {
    const data = await deleteMessage(req.params.id, req.user.id);
    successResponce({ res, message: "Message deleted successfully", data });
  }),
);

export default router;
