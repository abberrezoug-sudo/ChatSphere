import { Types } from "mongoose";
import { MessageRepository } from "../repositories/message.repository.js";
import { MessageType } from "../models/message.model.js";

const messageRepository = new MessageRepository();

export class MessageService {
  async sendMessage(
    sender: string,
    room: string,
    content: string,
    type: MessageType = MessageType.TEXT
  ) {
    if (!Types.ObjectId.isValid(sender)) {
      throw new Error("Invalid sender");
    }

    if (!Types.ObjectId.isValid(room)) {
      throw new Error("Invalid room");
    }

    return await messageRepository.create({
      sender: new Types.ObjectId(sender),
      room: new Types.ObjectId(room),
      content,
      type,
    });
  }

  async getRoomMessages(roomId: string) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new Error("Invalid room");
    }

    return await messageRepository.findByRoom(roomId);
  }

  async editMessage(messageId: string, content: string) {
    return await messageRepository.editMessage(messageId, content);
  }

  async deleteMessage(messageId: string) {
    return await messageRepository.deleteMessage(messageId);
  }
}