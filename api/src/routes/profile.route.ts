import { Router } from "express";
import { getProfileHandler } from "../controllers/profile.controller.js";

const profileRoutes = Router();

profileRoutes.get("/", getProfileHandler);

export default profileRoutes;
