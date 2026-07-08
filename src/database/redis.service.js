import { client } from "./redis.js";

export const setRedis = async (key, value, ttl) => {
  await client.set(key, value);
  if (ttl) {
    await client.expire(key, ttl);
  }
};

export const getRedis = async (key) => {
  const value = await client.get(key);
  return value;
};

export const deleteRedis = async (key) => {
  await client.del(key);
};

export const ttlRedis = async (key) => {
  const ttl = await client.ttl(key);
  return ttl;
};

export const existsRedis = async (key) => {
  const exists = await client.exists(key);
  return exists === 1;
};

export const mGetRedis = async (...keys) => {
  const values = await client.mGet(keys);
  return values;
};

export const createRevokeToken = async (userId, token) => {
  return `revokeToken::${userId}:${token}`;
};
