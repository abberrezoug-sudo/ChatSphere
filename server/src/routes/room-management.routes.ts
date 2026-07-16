import { Router } from "express";
import {
  deleteRoom,
  removeRoomUser,
  setRoomRole,
  transferOwnership,
  updateRoomSettings,
} from "../controllers/room-management.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.patch("/:roomId/settings", authMiddleware, updateRoomSettings);
router.patch("/:roomId/roles", authMiddleware, setRoomRole);
router.post("/:roomId/transfer-ownership", authMiddleware, transferOwnership);
router.post("/:roomId/remove-user", authMiddleware, removeRoomUser);
router.delete("/:roomId", authMiddleware, deleteRoom);

export default router;
