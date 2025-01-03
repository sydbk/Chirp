import { z } from "zod";
import catchErrors from "../utils/catchErrors.js";
import { CONFLICT, CREATED, OK, UNAUTHORIZED } from "../constants/http.js";
import UserModel from "../models/user.model.js";
import SessionModel from "../models/session.model.js";
import jwt from "jsonwebtoken";
import appAssert from "../utils/appAssert.js";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env.js";
import { setAuthCookies } from "../utils/cookies.js";

const signupSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .trim()
    .transform((name) => name.replace(/\s+/g, " ")),
  username: z
    .string()
    .min(3)
    .max(15)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6).max(64),
  userAgent: z.string().optional(),
});

export const signupHandler = catchErrors(async (req, res) => {
  const request = signupSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const userExists = await UserModel.exists({
    username: request.username,
  });
  appAssert(!userExists, CONFLICT, "Username is already taken");

  const user = await UserModel.create({
    name: request.name,
    username: request.username,
    password: request.password,
  });

  const session = await SessionModel.create({
    userId: user._id,
    userAgent: request.userAgent,
  });

  const refreshToken = jwt.sign(
    {
      sessionId: session._id,
    },
    JWT_REFRESH_SECRET,
    {
      audience: ["user"],
      expiresIn: "30d",
    }
  );

  const accessToken = jwt.sign(
    {
      sessionId: session._id,
      userId: user._id,
    },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user.omitPassword());
});

const loginSchema = z.object({
  username: z.string().max(255),
  password: z.string().max(255),
  userAgent: z.string().optional(),
});

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const user = await UserModel.findOne({
    username: request.username,
  });
  appAssert(user, UNAUTHORIZED, "Invalid username or password");

  const isValid = await user.comparePassword(request.password);
  appAssert(isValid, UNAUTHORIZED, "Invalid username or password");

  const session = await SessionModel.create({
    userId: user._id,
    userAgent: request.userAgent,
  });

  const refreshToken = jwt.sign(
    {
      sessionId: session._id,
    },
    JWT_REFRESH_SECRET,
    {
      audience: ["user"],
      expiresIn: "30d",
    }
  );

  const accessToken = jwt.sign(
    {
      sessionId: session._id,
      userId: user._id,
    },
    JWT_SECRET,
    {
      audience: ["user"],
      expiresIn: "15m",
    }
  );

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json(user.omitPassword());
});
