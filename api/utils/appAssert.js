import assert from "node:assert";
import AppError from "./appError.js";

const appAssert = (condition, httpStatusCode, message) =>
  assert(condition, new AppError(httpStatusCode, message));

export default appAssert;
