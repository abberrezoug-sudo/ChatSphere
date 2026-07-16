import { Types } from "mongoose";
import {
  RoomInvitation,
  RoomInvitationStatus,
} from "../models/room-invitation.model.js";

export class RoomInvitationRepository {
  async create(data: {
    roomId: string;
    invitedBy: string;
    token: string;
    expiresAt: Date;
    maxUses: number;
    invitedUser?: string;
  }) {
    return await RoomInvitation.create({
      room: new Types.ObjectId(data.roomId),
      invitedBy: new Types.ObjectId(data.invitedBy),
      invitedUser: data.invitedUser
        ? new Types.ObjectId(data.invitedUser)
        : null,
      token: data.token,
      expiresAt: data.expiresAt,
      maxUses: data.maxUses,
    });
  }

  async findByToken(token: string) {
    return await RoomInvitation.findOne({ token });
  }

  async findById(id: string) {
    return await RoomInvitation.findById(id);
  }

  async findByRoom(roomId: string, limit = 20, before?: string) {
    const query: any = {
      room: new Types.ObjectId(roomId),
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const invitations = await RoomInvitation.find(query)
      .populate("invitedBy", "username avatar")
      .populate("invitedUser", "username avatar")
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = invitations.length > limit;

    return {
      invitations: hasMore
        ? invitations.slice(0, limit)
        : invitations,
      hasMore,
    };
  }

  async accept(invitationId: string, userId: string) {
    return await RoomInvitation.findByIdAndUpdate(
      invitationId,
      {
        $inc: { uses: 1 },
        $addToSet: {
          acceptedBy: new Types.ObjectId(userId),
        },
      },
      { new: true }
    );
  }

  async setStatus(
    invitationId: string,
    status: RoomInvitationStatus
  ) {
    return await RoomInvitation.findByIdAndUpdate(
      invitationId,
      { status },
      { new: true }
    );
  }
}
