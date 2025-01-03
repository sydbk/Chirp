import { Router } from "express";
import { loginHandler, signupHandler } from "../controllers/auth.controller.js";

const authRoutes = Router();

authRoutes.post("/signup", signupHandler);
authRoutes.post("/login", loginHandler);

export default authRoutes;
