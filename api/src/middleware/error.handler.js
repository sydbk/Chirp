import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http.js";
import { ZodError } from "zod";
import AppError from "../utils/app.error.js";
import { clearAuthCookies, REFRESH_PATH } from "../utils/cookies.js";
import { NODE_ENV } from "../constants/env.js";

const handleZodError = (res, err) => {
  const errors = err.issues.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));

  res.status(BAD_REQUEST).json({
    message: err.message,
    errors,
  });
};

const handleAppError = (res, err) => {
  res.status(err.statusCode).json({
    message: err.message,
    errorCode: err.errorCode,
  });
};

const errorHandler = (err, req, res, next) => {
  if (NODE_ENV !== "production") {
    console.log(err);
  }

  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  if (err instanceof ZodError) {
    return handleZodError(res, err);
  }

  if (err instanceof AppError) {
    return handleAppError(res, err);
  }

  res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};

export default errorHandler;
