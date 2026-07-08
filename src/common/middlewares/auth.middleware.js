import jwt from "jsonwebtoken";
import { UnauthorizedException } from "../responce/error.responce.js";
import { env } from "../../../config/env.service.js";
import { createRevokeToken, existsRedis } from "../../database/redis.service.js";

export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return UnauthorizedException({ message: "Unauthorized" });
    }

    const [flag, token] = authorization.split(" ");

    if (flag !== "Bearer") {
      return UnauthorizedException({ message: "Unauthorized" });
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
      return UnauthorizedException({ message: "Unauthorized" });
    }

    const revoked = await existsRedis(
      await createRevokeToken(verifiedToken.id, token),
    );
    if (revoked) {
      return UnauthorizedException({ message: "Token has been revoked" });
    }

    req.user = verifiedToken;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
};
