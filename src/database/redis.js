import { createClient } from "redis";
import { env } from "../../config/env.service.js";
import { BadRequestException } from "../common/responce/error.responce.js";

export const client = createClient({
  url: env.REDIS_URL,
});

export const connectRedis = async () => {
  try {
    client.on("error", function (err) {
      throw err;
    });
    await client.connect();
    console.log("redis conneted");
  } catch (error) {
    BadRequestException("Redis connection error", 500, error.message);
  }
};

// Disconnect after usage
// await client.disconnect();
