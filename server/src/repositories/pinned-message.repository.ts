import { Types } from "mongoose";
import { PinnedMessage } from "../models/pinned-message.model.js";

export class PinnedMessageRepository {
  async findActivePin(messageId: string) {
    return PinnedMessage.findOne({
      message: new Types.ObjectId(messageId),
      active: true,
    });
  }

  async pin(messageId: string, roomId: string, userId: string) {
    return PinnedMessage.create({
      message: new Types.ObjectId(messageId),
      room: new Types.ObjectId(roomId),
      pinnedBy: new Types.ObjectId(userId),
      active: true,
    });
  }

  async unpin(pinId: string) {
    return PinnedMessage.findByIdAndUpdate(
      pinId,
      { active: false, unpinnedAt: new Date() },
      { new: true }
    );
  }

  async getPinnedMessages(roomId: string) {
    return PinnedMessage.find({
      room: new Types.ObjectId(roomId),
      active: true,
    })
      .sort({ createdAt: -1 })
      .populate("message")
      .populate("pinnedBy", "username avatar");
  }
}