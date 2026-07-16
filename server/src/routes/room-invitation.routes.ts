import { Router } from "express";
import {
  acceptInvitation,
  createInviteLink,
  getRoomInvitations,
  inviteUser,
  rejectInvitation,
  revokeInvitation,
} from "../controllers/room-invitation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/rooms/:roomId/invitations", authMiddleware, getRoomInvitations);
router.post("/rooms/:roomId/invitations/user", authMiddleware, inviteUser);
router.post("/rooms/:roomId/invitations/link", authMiddleware, createInviteLink);
router.post("/invitations/accept", authMiddleware, acceptInvitation);
router.post("/invitations/reject", authMiddleware, rejectInvitation);
router.post(
  "/invitations/:invitationId/revoke",
  authMiddleware,
  revokeInvitation
);

export default router;
