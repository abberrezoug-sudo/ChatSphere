import { Types } from "mongoose";
import {
  Message,
  type IMessage,
  MessageType,
} from "../models/message.model.js";

interface CreateMessagePayload {
  sender: Types.ObjectId;
  receiver?: Types.ObjectId;
  room?: string | Types.ObjectId;
  content: string;
  type?: MessageType;
}

export class MessageRepository {
  async create(data: CreateMessagePayload): Promise<IMessage> {
    return await Message.create({
      sender: data.sender,
      receiver: data.receiver,
      room: data.room?.toString(),
      content: data.content,
      type: data.type ?? MessageType.TEXT,
    });
  }

  async findById(id: string): Promise<IMessage | null> {
    return await Message.findById(id)
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");
  }

  async findByIdRaw(id: string): Promise<IMessage | null> {
    return await Message.findById(id);
  }

  async findByRoom(roomId: string, limit = 50): Promise<IMessage[]> {
    const messages = await Message.find({
      room: roomId,
      deleted: false,
    })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .limit(limit);

    return messages.reverse();
  }

  async editMessage(
    messageId: string,
    content: string
  ): Promise<IMessage | null> {
    return await Message.findByIdAndUpdate(
      messageId,
      {
        content,
        edited: true,
      },
      {
        new: true,
      }
    ).populate("sender", "username avatar");
  }

  async deleteMessage(messageId: string): Promise<IMessage | null> {
    return await Message.findByIdAndUpdate(
      messageId,
      {
        deleted: true,
      },
      {
        new: true,
      }
    ).populate("sender", "username avatar");
  }
}
