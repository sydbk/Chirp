import { NODE_ENV } from "../constants/env.js";
import { INTERNAL_SERVER_ERROR } from "../constants/http.js";

const errorHandler = (error, req, res, next) => {
  if (NODE_ENV !== "production") {
    console.log(`PATH: ${req.path}`, error);
  }

  return res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};

export default errorHandler;
