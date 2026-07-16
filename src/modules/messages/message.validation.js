import Joi from "joi";

export const reactSchema = Joi.object({
  emoji: Joi.string().trim().min(1).max(8).required(),
});

export const replySchema = Joi.object({
  content: Joi.string().trim().min(1).required(),
});
