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

  async getPinnedMessages(roomId: string, limit = 20, before?: string) {
    const query: any = {
      room: new Types.ObjectId(roomId),
      active: true,
    };

    if (before) {
      query.createdAt = {
        $lt: new Date(before),
      };
    }

    const pinnedMessages = await PinnedMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate("message")
      .populate("pinnedBy", "username avatar");

    const hasMore = pinnedMessages.length > limit;

    return {
      pinnedMessages: hasMore
        ? pinnedMessages.slice(0, limit)
        : pinnedMessages,

      hasMore,
    };
  }
}
