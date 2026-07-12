import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../responce/error.responce.js";
import { env } from "../../../config/env.service.js";
import { createRevokeToken, existsRedis } from "../../database/redis.service.js";

const verifyAuthToken = async (authorization) => {
  const [flag, token] = authorization.split(" ");
  if (flag !== "Bearer") {
    UnauthorizedException({ message: "Unauthorized" });
  }

  const role = jwt.decode(token).aud;
  let signature = "";
  switch (role) {
    case "0":
      signature = env.ADMIN_JWT_SECRET;
      break;
    case "1":
      signature = env.USER_JWT_SECRET;
      break;
    default:
      break;
  }

  const verifiedToken = jwt.verify(token, signature);

  if (verifiedToken.iss !== "localhost:3000") {
    UnauthorizedException({ message: "Unauthorized" });
  }

  const revoked = await existsRedis(
    await createRevokeToken(verifiedToken.id, token),
  );
  if (revoked) {
    UnauthorizedException({ message: "Token has been revoked" });
  }

  return { user: verifiedToken, token };
};

export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return UnauthorizedException({ message: "Unauthorized" });
    }

    const { user, token } = await verifyAuthToken(authorization);
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
};

// Populates req.user when a valid token is present, otherwise continues
// as an anonymous request instead of rejecting it.
export const optionalAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next();
  }

  try {
    const { user, token } = await verifyAuthToken(authorization);
    req.user = user;
    req.token = token;
  } catch {
    // invalid/expired token: treat as anonymous rather than rejecting
  }
  next();
};
