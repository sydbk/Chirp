import { RequestHandler } from "express";
import appAssert from "../utils/app.assert.js";
import { UNAUTHORIZED } from "../constants/http.js";
import { AccessTokenPayload, verifyToken } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      sessionId: string;
    }
  }
}

const authenticate: RequestHandler = (req, _, next) => {
  const accessToken = req.cookies.accessToken;
  appAssert(accessToken, UNAUTHORIZED, "Not authorized");

  const { payload, error } = verifyToken<AccessTokenPayload>(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token"
  );

  req.userId = payload.userId;
  req.sessionId = payload.sessionId;

  next();
};

export default authenticate;
