import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http.js";
import { ZodError } from "zod";
import { NODE_ENV } from "../constants/env.js";
import AppError from "../utils/app.error.js";

const zodErrorHandler = (err: ZodError, res: Response) => {
  const errors = err.issues.map((e) => ({
    path: e.path.join("."),
    message: e.message,
  }));

  res.status(BAD_REQUEST).json({
    message: err.message,
    errors,
  });
};

const appErrorHandler = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({ message: err.message });
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (NODE_ENV !== "production") {
    console.log(`PATH: ${req.path})`, err);
  }

  if (err instanceof ZodError) {
    zodErrorHandler(err, res);
  }

  if (err instanceof AppError) {
    return appErrorHandler(err, res);
  }

  res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};

export default errorHandler;
