import { Request, Response } from "express";
import { ZodError } from "zod";
import { RoomInvitationService } from "../services/room-invitation.service.js";
import {
  createInviteLinkSchema,
  invitationListSchema,
  invitationTokenSchema,
  inviteUserSchema,
} from "../validators/room-invitation.validator.js";

const roomInvitationService = new RoomInvitationService();

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join(", ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
};

export const inviteUser = async (req: Request, res: Response) => {
  try {
    const data = inviteUserSchema.parse(req.body);
    const invitation = await roomInvitationService.inviteUser({
      roomId: String(req.params.roomId),
      invitedBy: req.user!.id,
      invitedUser: data.userId,
      expiresAt: data.expiresAt,
      maxUses: data.maxUses,
    });

    res.status(201).json({
      success: true,
      message: "Invitation created",
      invitation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const createInviteLink = async (req: Request, res: Response) => {
  try {
    const data = createInviteLinkSchema.parse(req.body);
    const invitation = await roomInvitationService.createInviteLink({
      roomId: String(req.params.roomId),
      invitedBy: req.user!.id,
      expiresAt: data.expiresAt,
      maxUses: data.maxUses,
    });

    res.status(201).json({
      success: true,
      message: "Invite link created",
      invitation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const data = invitationTokenSchema.parse(req.body);
    const invitation = await roomInvitationService.acceptInvitation(
      data.token,
      req.user!.id
    );

    res.status(200).json({
      success: true,
      message: "Invitation accepted",
      invitation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const rejectInvitation = async (req: Request, res: Response) => {
  try {
    const data = invitationTokenSchema.parse(req.body);
    const invitation = await roomInvitationService.rejectInvitation(
      data.token,
      req.user!.id
    );

    res.status(200).json({
      success: true,
      message: "Invitation rejected",
      invitation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const revokeInvitation = async (req: Request, res: Response) => {
  try {
    const invitation = await roomInvitationService.revokeInvitation(
      String(req.params.invitationId),
      req.user!.id
    );

    res.status(200).json({
      success: true,
      message: "Invitation revoked",
      invitation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getRoomInvitations = async (req: Request, res: Response) => {
  try {
    const query = invitationListSchema.parse(req.query);
    const result = await roomInvitationService.getRoomInvitations(
      String(req.params.roomId),
      req.user!.id,
      query.limit ?? 20,
      query.before
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
