import { fifteenMinutesFromNow } from "../utils/date.js";

const defaults = {
  sameSite: "strict",
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
};

const accessTokenOptions = () => ({
  ...defaults,
  expires: fifteenMinutesFromNow(),
});

const refreshTokenOptions = () => ({
  ...defaults,
  expires: thirtyDaysFromNow(),
  path: "/auth/refresh",
});

export const setAuthCookies = ({ res, accessToken, refreshToken }) =>
  res
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions);
