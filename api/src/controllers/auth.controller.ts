import catchErrors from "../utils/catchErrors.js";
import { loginSchema, signupSchema } from "../schemas/user.schema.js";
import prisma from "../config/prisma.js";
import { CONFLICT, CREATED, OK, UNAUTHORIZED } from "../constants/http.js";
import { compareValue, hashValue } from "../utils/bcrypt.js";
import { ONE_DAY_MS, thirtyDaysFromNow } from "../utils/date.js";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies.js";
import appAssert from "../utils/app.assert.js";
import {
  accessTokenOptions,
  AccessTokenPayload,
  refreshTokenOptions,
  RefreshTokenPayload,
  signToken,
  verifyToken,
} from "../utils/jwt.js";

export const signupHandler = catchErrors(async (req, res) => {
  const request = signupSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const usernameTaken = await prisma.user.findFirst({
    where: { username: { equals: request.username, mode: "insensitive" } },
  });
  appAssert(!usernameTaken, CONFLICT, "This username is taken");

  const hashedPassword = await hashValue(request.password);

  const user = await prisma.user.create({
    data: {
      name: request.name,
      username: request.username,
      password: hashedPassword,
    },
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: request.userAgent,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  const refreshToken = signToken(
    { sessionId: session.id },
    refreshTokenOptions
  );

  const accessToken = signToken(
    { userId: user.id, sessionId: session.id },
    accessTokenOptions
  );

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json({ ...user, password: undefined });
});

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const user = await prisma.user.findFirst({
    where: {
      username: { equals: request.username, mode: "insensitive" },
    },
  });
  appAssert(user, UNAUTHORIZED, "Invalid username or password");

  const isValid = await compareValue(request.password, user.password);
  appAssert(isValid, UNAUTHORIZED, "Invalid username or password");

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: request.userAgent,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  const refreshToken = signToken(
    { sessionId: session.id },
    refreshTokenOptions
  );

  const accessToken = signToken(
    { userId: user.id, sessionId: session.id },
    accessTokenOptions
  );

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ ...user, password: undefined });
});

export const logoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const { payload } = verifyToken<AccessTokenPayload>(accessToken);

  if (payload) {
    await prisma.session.delete({ where: { id: payload.sessionId } });
  }

  return clearAuthCookies(res).status(OK).json({
    message: "Logout successful",
  });
});

export const refreshTokenHandler = catchErrors(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
  });
  appAssert(
    session && session.expiresAt.getTime() > Date.now(),
    UNAUTHORIZED,
    "Session expired"
  );

  const refreshSession = session.expiresAt.getTime() - Date.now() <= ONE_DAY_MS;

  if (refreshSession) {
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: thirtyDaysFromNow() },
    });
  }

  const newRefreshToken = refreshSession
    ? signToken({ sessionId: session.id }, refreshTokenOptions)
    : undefined;

  const accessToken = signToken(
    { userId: session.userId, sessionId: session.id },
    accessTokenOptions
  );

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({ message: "Access token refreshed." });
});
