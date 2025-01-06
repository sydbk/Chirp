import catchErrors from "../utils/catchErrors.js";
import { signupSchema } from "../schemas/user.schema.js";
import prisma from "../config/prisma.js";
import { CONFLICT, CREATED } from "../constants/http.js";
import { hashValue } from "../utils/bcrypt.js";
import { thirtyDaysFromNow } from "../utils/date.js";
import { setAuthCookies } from "../utils/cookies.js";
import appAssert from "../utils/app.assert.js";
import {
  accessTokenOptions,
  refreshTokenOptions,
  signToken,
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
