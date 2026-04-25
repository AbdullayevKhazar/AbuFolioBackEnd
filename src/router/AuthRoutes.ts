import { Router } from "express";
import { login, refreshAccessToken, register } from "../controller/AuthController";
const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/refresh", refreshAccessToken);

export default authRoutes;
