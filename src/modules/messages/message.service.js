import { env } from "../../../config/env.service.js";
import { BadRequestException } from "../../common/responce/error.responce.js";
import { MessageModel } from "../../database/models/message.model.js";
import { userModel } from "../../database/models/user.model.js";

/** @param {string} [senderId] */
export const sendMessage = async (data, image, senderId) => {
  const { content, receiver } = data;
  if (!content || !receiver) {
    BadRequestException({ message: "content and receiver are required" });
  }

  const user = await userModel.findById(receiver);
  if (!user) {
    BadRequestException({ message: "User not found" });
  }
  let Image = "";
  if (image) {
    Image = `${env.SERVER_URI}/${image.path}`;
  }

  const message = await MessageModel.create({
    content,
    sender: senderId,
    receiver,
    Image,
  });
  if (!message) {
    BadRequestException({ message: "Message not sent" });
  }
  return message;
};

export const getMessages = async (userId) => {
  const messages = await MessageModel.find({ receiver: userId })
    .select("-sender")
    .sort({ createdAt: -1 });
  return messages;
};

export const deleteMessage = async (id, userId) => {
  const message = await MessageModel.findOneAndDelete({
    _id: id,
    $or: [{ sender: userId }, { receiver: userId }],
  });
  if (!message) {
    BadRequestException({ message: "Message not found" });
  }
  return message;
};
