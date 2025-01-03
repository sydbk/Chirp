import { ZodError } from "zod";
import { NODE_ENV } from "../constants/env.js";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http.js";
import AppError from "../utils/appError.js";

const zodErrorHandler = (error, res) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  return res.status(BAD_REQUEST).json({ message: errors.message, errors });
};

const appErrorHandler = (error, res) => {
  return res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

const errorHandler = (error, req, res, next) => {
  if (NODE_ENV !== "production") {
    console.log(`PATH: ${req.path}`, error);
  }

  if (error instanceof ZodError) {
    return zodErrorHandler(error, res);
  }

  if (error instanceof AppError) {
    return appErrorHandler(error, res);
  }

  return res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};

export default errorHandler;
