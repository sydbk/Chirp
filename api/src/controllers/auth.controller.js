import prisma from "../config/prisma.js";
import appAssert from "../utils/app.assert.js";
import catchErrors from "../utils/catch.errors.js";
import { loginSchema, signupSchema } from "./schema.js";
import {
  CONFLICT,
  CREATED,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "../constants/http.js";
import { hashValue, compareValue } from "../utils/bcrypt.js";
import { ONE_DAY_MS, thirtyDaysFromNow } from "../utils/date.js";
import {
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from "../utils/jwt.js";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies.js";

export const signupHandler = catchErrors(async (req, res) => {
  const request = signupSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const existingUsername = await prisma.user.findFirst({
    where: { username: { equals: request.username, mode: "insensitive" } },
  });
  appAssert(!existingUsername, CONFLICT, "This username is already taken");

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
    refreshTokenSignOptions
  );

  const accessToken = signToken({
    userId: user.id,
    sessionId: session.id,
  });

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
    refreshTokenSignOptions
  );

  const accessToken = signToken({
    userId: user.id,
    sessionId: session.id,
  });

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ ...user, password: undefined });
});

export const logoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const { payload } = verifyToken(accessToken);

  if (payload) {
    await prisma.session.delete({ where: { id: payload.sessionId } });
  }

  return clearAuthCookies(res).status(OK).json({
    message: "Logout successful",
  });
});

export const refreshHandler = catchErrors(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  appAssert(refreshToken, UNAUTHORIZED, "Missing refresh token");

  const { payload } = verifyToken(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
  });
  const now = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    "Session expired"
  );

  const sessionNeedRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;

  if (sessionNeedRefresh) {
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: thirtyDaysFromNow() },
    });
  }

  const newRefreshToken = sessionNeedRefresh
    ? signToken({ sessionId: session.id }, refreshTokenSignOptions)
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session.id,
  });

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({ message: "Access token refreshed." });
});

export const getUserHandler = catchErrors(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });
  appAssert(user, NOT_FOUND, "User not found.");

  return res.status(OK).json({ ...user, password: undefined });
});
