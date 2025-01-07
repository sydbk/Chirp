import { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  signupHandler,
} from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/signup", signupHandler);
authRoutes.post("/login", loginHandler);
authRoutes.get("/logout", logoutHandler);
authRoutes.get("/refresh", refreshTokenHandler);

export default authRoutes;
