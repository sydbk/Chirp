import API from "../config/apiClient";
import { LoginFormData } from "../pages/Login";
import { SignUpFormData } from "../pages/SignUp";

export const signup = async (data: SignUpFormData) =>
  API.post("/auth/signup", data);

export const login = async (data: LoginFormData) =>
  API.post("/auth/login", data);

export const logout = async () => API.get("/auth/logout");

export const getProfile = async () => API.get("/profile");
