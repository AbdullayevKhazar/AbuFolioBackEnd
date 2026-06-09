import { Router } from "express";
import {
  getCurrentUser,
  login,
  refreshAccessToken,
  register,
} from "../controller/AuthController";
import { verifyToken } from "../middleware/auth";
const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/refresh", refreshAccessToken);
authRoutes.get("/me", verifyToken, getCurrentUser);

export default authRoutes;
