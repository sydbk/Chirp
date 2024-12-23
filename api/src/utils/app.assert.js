import assert from "node:assert";
import AppError from "./app.error.js";

const appAssert = (condition, httpStatusCode, message, errorCode) =>
  assert(condition, new AppError(httpStatusCode, message, errorCode));

export default appAssert;
