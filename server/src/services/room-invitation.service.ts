import crypto from "crypto";
import { Types } from "mongoose";
import { RoomInvitationStatus } from "../models/room-invitation.model.js";
import { RoomInvitationRepository } from "../repositories/room-invitation.repository.js";
import { RoomRepository } from "../repositories/room.repository.js";
import {
  RoomPermission,
  RoomPermissionService,
} from "./room-permission.service.js";

const roomInvitationRepository = new RoomInvitationRepository();
const roomRepository = new RoomRepository();
const roomPermissionService = new RoomPermissionService();

export class RoomInvitationService {
  async inviteUser(data: {
    roomId: string;
    invitedBy: string;
    invitedUser: string;
    expiresAt: string;
    maxUses?: number;
  }) {
    this.validateRoom(data.roomId);
    this.validateUser(data.invitedBy);
    this.validateUser(data.invitedUser);

    await roomPermissionService.assertPermission(
      data.roomId,
      data.invitedBy,
      RoomPermission.INVITE_USERS
    );

    return await this.createInvitation({
      ...data,
      maxUses: data.maxUses ?? 1,
    });
  }

  async createInviteLink(data: {
    roomId: string;
    invitedBy: string;
    expiresAt: string;
    maxUses?: number;
  }) {
    this.validateRoom(data.roomId);
    this.validateUser(data.invitedBy);

    await roomPermissionService.assertPermission(
      data.roomId,
      data.invitedBy,
      RoomPermission.INVITE_USERS
    );

    return await this.createInvitation({
      ...data,
      maxUses: data.maxUses ?? 1,
    });
  }

  async acceptInvitation(token: string, userId: string) {
    this.validateUser(userId);

    const invitation = await roomInvitationRepository.findByToken(token);

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    this.assertInvitationUsable(invitation, userId);

    await roomRepository.addMember(invitation.room.toString(), userId);

    const updatedInvitation = await roomInvitationRepository.accept(
      invitation.id,
      userId
    );

    if (updatedInvitation && updatedInvitation.uses >= updatedInvitation.maxUses) {
      await roomInvitationRepository.setStatus(
        updatedInvitation.id,
        RoomInvitationStatus.ACCEPTED
      );
    }

    return updatedInvitation;
  }

  async rejectInvitation(token: string, userId: string) {
    this.validateUser(userId);

    const invitation = await roomInvitationRepository.findByToken(token);

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (
      invitation.invitedUser &&
      invitation.invitedUser.toString() !== userId
    ) {
      throw new Error("This invitation belongs to another user");
    }

    return await roomInvitationRepository.setStatus(
      invitation.id,
      RoomInvitationStatus.REJECTED
    );
  }

  async revokeInvitation(invitationId: string, userId: string) {
    if (!Types.ObjectId.isValid(invitationId)) {
      throw new Error("Invalid invitation");
    }

    this.validateUser(userId);

    const invitation = await roomInvitationRepository.findById(invitationId);

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    await roomPermissionService.assertPermission(
      invitation.room.toString(),
      userId,
      RoomPermission.INVITE_USERS
    );

    return await roomInvitationRepository.setStatus(
      invitation.id,
      RoomInvitationStatus.REVOKED
    );
  }

  async getRoomInvitations(
    roomId: string,
    userId: string,
    limit = 20,
    before?: string
  ) {
    this.validateRoom(roomId);
    this.validateUser(userId);

    await roomPermissionService.assertPermission(
      roomId,
      userId,
      RoomPermission.INVITE_USERS
    );

    return await roomInvitationRepository.findByRoom(roomId, limit, before);
  }

  private async createInvitation(data: {
    roomId: string;
    invitedBy: string;
    expiresAt: string;
    maxUses: number;
    invitedUser?: string;
  }) {
    const expiresAt = new Date(data.expiresAt);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      throw new Error("Expiration date must be in the future");
    }

    if (data.maxUses < 1) {
      throw new Error("maxUses must be greater than 0");
    }

    return await roomInvitationRepository.create({
      roomId: data.roomId,
      invitedBy: data.invitedBy,
      invitedUser: data.invitedUser,
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt,
      maxUses: data.maxUses,
    });
  }

  private assertInvitationUsable(invitation: any, userId: string) {
    if (invitation.status !== RoomInvitationStatus.PENDING) {
      throw new Error("Invitation is not active");
    }

    if (invitation.expiresAt <= new Date()) {
      throw new Error("Invitation has expired");
    }

    if (invitation.uses >= invitation.maxUses) {
      throw new Error("Invitation has reached maximum uses");
    }

    if (
      invitation.invitedUser &&
      invitation.invitedUser.toString() !== userId
    ) {
      throw new Error("This invitation belongs to another user");
    }

    const alreadyAccepted = invitation.acceptedBy.some((acceptedUser: any) => {
      return acceptedUser.toString() === userId;
    });

    if (alreadyAccepted) {
      throw new Error("Invitation already accepted by this user");
    }
  }

  private validateRoom(roomId: string) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new Error("Invalid room");
    }
  }

  private validateUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user");
    }
  }
}
