import { Router } from "express";
import {
  getUserHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  signupHandler,
} from "../controllers/auth.controller.js";
import authenticate from "../middleware/authenticate.js";

const authRoutes = Router();

authRoutes.post("/signup", signupHandler);
authRoutes.post("/login", loginHandler);
authRoutes.get("/logout", logoutHandler);
authRoutes.get("/refresh", refreshHandler);
authRoutes.get("/user", authenticate, getUserHandler);

export default authRoutes;
