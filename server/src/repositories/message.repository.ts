import { Types } from "mongoose";
import { Message, IMessage, MessageType } from "../models/message.model.js";

interface CreateMessagePayload {
  sender: Types.ObjectId;
  room: Types.ObjectId;
  content: string;
  type?: MessageType;
   replyTo?: Types.ObjectId | null;

fileUrl?: string;
fileName?: string;
fileSize?: number;
mimeType?: string;
}

export class MessageRepository {
  async create(data: CreateMessagePayload): Promise<IMessage> {
    return await Message.create({
      sender: data.sender,
      room: data.room,
      content: data.content,
      type: data.type ?? MessageType.TEXT,
       replyTo: data.replyTo ?? null,
       fileUrl: data.fileUrl,
  fileName: data.fileName,
  fileSize: data.fileSize,
  mimeType: data.mimeType,
    });
  }

  async findById(id: string): Promise<IMessage | null> {
    return await Message.findById(id)
      .populate("sender", "username avatar")
      .populate("room");
  }

  async findByIdRaw(id: string): Promise<IMessage | null> {
    return await Message.findById(id);
  }

  async findByRoom(
    roomId: string,
    limit = 50
  ): Promise<IMessage[]> {
    return await Message.find({
      room: roomId,
      deleted: false,
    })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async editMessage(
    messageId: string,
    content: string
  ): Promise<IMessage | null> {
    await Message.findByIdAndUpdate(
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

  async deleteMessage(messageId: string) {
  return await Message.findByIdAndUpdate(
    messageId,
    {
      deleted: true,
      content: "Ce message a été supprimé."
    },
    {
      returnDocument: "after"
    }
  ).populate("sender", "username avatar");
}
//
async seenMessage(messageId: string, userId: string) {
  return await Message.findByIdAndUpdate(
    messageId,
    {
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
  ).populate("sender", "username avatar");
}
async reactToMessage(
  messageId: string,
  userId: string,
  emoji: string
) {
  const message = await Message.findById(messageId);

  if (!message) {
    return null;
  }

  const index = message.reactions.findIndex(
    (reaction) =>
      reaction.user.toString() === userId
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
async getLastMessage(roomId: string) {
  return Message.findOne({
    room: roomId
  })
    .populate("sender", "username avatar")
    .sort({ createdAt: -1 });
}
//unreadCount
async countUnreadRoomMessages(
  roomId: string,
  userId: string
) {
  return await Message.countDocuments({
    room: roomId,

    sender: {
      $ne: new Types.ObjectId(userId),
    },

    seenBy: {
      $not: {
        $elemMatch: {
          user: new Types.ObjectId(userId),
        },
      },
    },
  });
}
}