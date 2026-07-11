import { Router } from "express";

import {
  register,
  login,
  refreshToken,
  getMe,
  logout,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authMiddleware, getMe);

router.post("/refresh", refreshToken);

router.post("/refresh-token", refreshToken);

router.post("/logout", authMiddleware, logout);

export default router;
