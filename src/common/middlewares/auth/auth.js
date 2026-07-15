import { env } from "../../../../config/env.service.js";
import jwt from "jsonwebtoken";

export const generateToken = (payload, host, role) => {
  let signature = "";
  let refreshSignature = "";
  switch (role) {
    case 0:
      signature = env.ADMIN_JWT_SECRET;
      refreshSignature = env.ADMIN_REFRESH_SECRET;
      break;
    case 1:
      signature = env.USER_JWT_SECRET;
      refreshSignature = env.USER_REFRESH_SECRET;
      break;
    default:
      break;
  }

  const accessToken = jwt.sign({ id: payload._id }, signature, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: host,
    audience: `${role}`,
  });

  const refreshToken = jwt.sign({ id: payload._id }, refreshSignature, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: host,
    audience: `${role}`,
  });
  const token = { accessToken, refreshToken };
  return token;
};

export const generateAccessToken = async (refreshtoken, host) => {
  const [flag, token] = refreshtoken.split(" ");
  const verifiedToken = jwt.decode(token);
  let signature = "";
  switch (verifiedToken.aud) {
    case "0":
      signature = env.ADMIN_JWT_SECRET;
      break;
    case "1":
      signature = env.USER_JWT_SECRET;
      break;
    default:
      break;
  }

  const accessToken = jwt.sign({ id: verifiedToken.id }, signature, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: host,
    audience: `${verifiedToken.aud}`,
  });
  return accessToken;
};
