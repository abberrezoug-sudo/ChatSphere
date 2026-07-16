import { Router } from "express";
import {
  archiveConversation,
  getArchivedConversations,
  restoreConversation,
} from "../controllers/archived-conversation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getArchivedConversations);
router.post("/", authMiddleware, archiveConversation);
router.post("/restore", authMiddleware, restoreConversation);

export default router;
