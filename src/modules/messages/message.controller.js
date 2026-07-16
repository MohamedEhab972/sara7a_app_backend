import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import successResponce from "../../common/responce/success.responce.js";
import { upload } from "../../common/middlewares/multer.js";
import { validation } from "../../common/middlewares/validation.js";
import { reactSchema, replySchema } from "./message.validation.js";
import {
  deleteMessage,
  getMessages,
  reactToMessage,
  replyToMessage,
  sendMessage,
} from "./message.service.js";
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

router.post(
  "/react-message/:id",
  auth,
  validation(reactSchema),
  asyncHandler(async (req, res) => {
    const result = await reactToMessage(req.params.id, req.user.id, req.body.emoji);
    successResponce({ res, message: "Reaction updated successfully", data: result });
  }),
);

router.post(
  "/reply-message/:id",
  auth,
  validation(replySchema),
  asyncHandler(async (req, res) => {
    const result = await replyToMessage(req.params.id, req.user.id, req.body.content);
    successResponce({ res, message: "Reply sent successfully", data: result });
  }),
);

export default router;
