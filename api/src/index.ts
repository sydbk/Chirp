import "dotenv/config";
import express from "express";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { OK } from "./constants/http.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
);

app.get("/", (_, res) => {
  res.status(OK).json({
    status: "healthy",
  });
});

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} environment`);
});
