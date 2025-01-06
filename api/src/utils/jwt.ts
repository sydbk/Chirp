import jwt, { SignOptions } from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env.js";

export type RefreshTokenPayload = {
  sessionId: string;
};

export type AccessTokenPayload = {
  userId: string;
  sessionId: string;
};

type SignOptionsAndSecret = SignOptions & {
  secret: string;
};

const defaults = {
  audience: ["user"],
};

export const accessTokenOptions = {
  expiresIn: "15m",
  secret: JWT_SECRET,
};

export const refreshTokenOptions = {
  expiresIn: "30d",
  secret: JWT_REFRESH_SECRET,
};

export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options: SignOptionsAndSecret
) => {
  const { secret, ...signOpts } = options;
  return jwt.sign(payload, secret, { ...defaults, ...signOpts });
};
