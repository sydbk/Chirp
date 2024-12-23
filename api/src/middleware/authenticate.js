import appAssert from "../utils/app.assert.js";
import { UNAUTHORIZED } from "../constants/http.js";
import ErrorCode from "../constants/error.code.js";
import { verifyToken } from "../utils/jwt.js";

const authenticate = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Not authorized",
    ErrorCode.InvalidAccessToken
  );

  const { payload, error } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token expired" : "Invalid token",
    ErrorCode.InvalidAccessToken
  );

  req.userId = payload.userId;
  req.sessionId = payload.sessionId;

  next();
};

export default authenticate;
