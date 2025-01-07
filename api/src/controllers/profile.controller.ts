import prisma from "../config/prisma.js";
import { OK, UNAUTHORIZED } from "../constants/http.js";
import appAssert from "../utils/app.assert.js";
import catchErrors from "../utils/catchErrors.js";

export const getProfileHandler = catchErrors(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
  });
  appAssert(user, UNAUTHORIZED, "User not found.");

  return res.status(OK).json({ ...user, password: undefined });
});
