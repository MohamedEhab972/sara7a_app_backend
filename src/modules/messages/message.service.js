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
    .select("-sender -reactions.user")
    .sort({ createdAt: -1 });
  return messages;
};

export const getSentMessages = async (userId) => {
  const messages = await MessageModel.find({ sender: userId }).sort({
    createdAt: -1,
  });
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

export const reactToMessage = async (id, userId, emoji) => {
  const message = await MessageModel.findOne({
    _id: id,
    $or: [{ sender: userId }, { receiver: userId }],
  });
  if (!message) {
    BadRequestException({ message: "Message not found" });
  }
  const index = message.reactions.findIndex((r) => r.user.equals(userId));
  if (index === -1) {
    message.reactions.push({ user: userId, emoji });
  } else if (message.reactions[index].emoji === emoji) {
    message.reactions.splice(index, 1);
  } else {
    message.reactions[index].emoji = emoji;
  }
  await message.save();
  return message;
};

export const replyToMessage = async (id, userId, content) => {
  const message = await MessageModel.findOneAndUpdate(
    { _id: id, receiver: userId },
    { $set: { reply: { content, createdAt: new Date() } } },
    { returnDocument: "after" },
  );
  if (!message) {
    BadRequestException({ message: "Message not found" });
  }
  return message;
};
