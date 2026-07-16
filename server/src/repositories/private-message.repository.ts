import { Types } from "mongoose";
import {
  PrivateMessage,
  PrivateMessageType,
} from "../models/private-message.model.js";

interface CreatePrivateMessagePayload {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  type?: PrivateMessageType;
  replyTo?: Types.ObjectId | null;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

interface FindConversationOptions {
  limit?: number;
  before?: Date;
}

export class PrivateMessageRepository {
  async create(data: CreatePrivateMessagePayload) {
    return await PrivateMessage.create({
      sender: data.sender,
      receiver: data.receiver,
      content: data.content,
      type: data.type ?? PrivateMessageType.TEXT,
      replyTo: data.replyTo ?? null,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
    });
  }

  async findById(id: string) {
    return await PrivateMessage.findById(id)
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar")
      .populate("replyTo");
  }

  async findByIdRaw(id: string) {
    return await PrivateMessage.findById(id);
  }

  /**
   * Récupère l'historique paginé d'une conversation entre deux utilisateurs,
   * triée du plus récent au plus ancien (comme findByRoom côté rooms).
   * Utiliser `before` (createdAt d'un message) pour paginer vers le passé.
   */
  async findConversation(
  userA: string,
  userB: string,
  limit = 20,
  before?: string
) {
  const query: any = {
    deleted: false,

    $or: [
      {
        sender: userA,
        receiver: userB,
      },
      {
        sender: userB,
        receiver: userA,
      },
    ],
  };

  if (before) {
    query.createdAt = {
      $lt: new Date(before),
    };
  }

  const messages = await PrivateMessage.find(query)
    .populate("sender", "username avatar")
    .populate("receiver", "username avatar")
    .sort({
      createdAt: -1,
    })
    .limit(limit + 1);

  const hasMore = messages.length > limit;

  return {
    messages: hasMore
      ? messages.slice(0, limit)
      : messages,

    hasMore,
  };
}
  async deleteMessage(messageId: string) {
    return await PrivateMessage.findByIdAndUpdate(
      messageId,
      {
        deleted: true,
        content: "Ce message a été supprimé.",
      },
      {
        returnDocument: "after",
      }
    )
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");
  }

  async seenMessage(messageId: string, userId: string) {
    return await PrivateMessage.findByIdAndUpdate(
      messageId,
      {
        seen: true,
        $addToSet: {
          seenBy: {
            user: userId,
            seenAt: new Date(),
          },
        },
      },
      {
        returnDocument: "after",
      }
    )
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");
  }

  async reactToMessage(messageId: string, userId: string, emoji: string) {
    const message = await PrivateMessage.findById(messageId);

    if (!message) {
      return null;
    }

    const index = message.reactions.findIndex(
      (reaction) => reaction.user.toString() === userId
    );

    if (index >= 0) {
      message.reactions[index].emoji = emoji;
    } else {
      message.reactions.push({
        user: new Types.ObjectId(userId),
        emoji,
      });
    }

    await message.save();

    return await this.findById(messageId);
  }
  async getUserMessages(userId: string) {
  return PrivateMessage.find({
    $or: [
      { sender: userId },
      { receiver: userId }
    ]
  })
    .populate("sender", "username avatar")
    .populate("receiver", "username avatar")
    .sort({ createdAt: -1 });
}
//unredAsync getUnreadCount(userId: string) {
async countUnreadMessages(
  userId: string,
  otherUserId: string
) {
  return await PrivateMessage.countDocuments({
    sender: otherUserId,
    receiver: userId,
    seenBy: {
      $not: {
        $elemMatch: {
          user: new Types.ObjectId(userId),
        },
      },
    },
  });
}
 async editMessage(messageId: string, content: string) {
    await PrivateMessage.findByIdAndUpdate(
      messageId,
      {
        content,
        edited: true,
      },
      {
        new: true,
      }
    );

    return await this.findById(messageId);
  }


}