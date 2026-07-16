import { Router } from "express";
import {
  blockUser,
  getBlockedUsers,
  unblockUser,
} from "../controllers/user-block.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getBlockedUsers);
router.post("/", authMiddleware, blockUser);
router.delete("/:userId", authMiddleware, unblockUser);

export default router;
