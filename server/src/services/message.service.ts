import { Types } from "mongoose";
import { MessageRepository } from "../repositories/message.repository.js";
import { MessageType } from "../models/message.model.js";

const messageRepository = new MessageRepository();
//handl err!! *****
console.log("Repository =", messageRepository);
console.log(
  "Methods =",
  Object.getOwnPropertyNames(Object.getPrototypeOf(messageRepository))
);
//ADD interfac
interface SendMessagePayload {
  sender: string;
  room: string;
  content?: string;
  type?: MessageType;

  replyTo?: string;

  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}
export class MessageService {
//sendMessageAsunchrounous
  async sendMessage(data: SendMessagePayload) {
    if (!Types.ObjectId.isValid(data.sender)) {
      throw new Error("Invalid sender");
    }

    if (!Types.ObjectId.isValid(data.room)) {
      throw new Error("Invalid room");
    }

   const message = await messageRepository.create({
  sender: new Types.ObjectId(data.sender),
  room: new Types.ObjectId(data.room),

  content: data.content ?? "",

  type: data.type ?? MessageType.TEXT,

  replyTo: data.replyTo
    ? new Types.ObjectId(data.replyTo)
    : null,

  fileUrl: data.fileUrl,
  fileName: data.fileName,
  fileSize: data.fileSize,
  mimeType: data.mimeType,
});

  }

  async getRoomMessages(roomId: string) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new Error("Invalid room");
    }

     return await messageRepository.findByRoom(roomId, 50);
  }

  async editMessage(messageId: string, content: string) {
    return await messageRepository.editMessage(messageId, content);
  }

  async editMessageForUser(
    messageId: string,
    sender: string,
    content: string
  ) {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new Error("Invalid message");
    }

    if (!Types.ObjectId.isValid(sender)) {
      throw new Error("Invalid sender");
    }

    const message = await messageRepository.findByIdRaw(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.deleted) {
      throw new Error("Message is deleted");
    }

    if (message.sender.toString() !== sender) {
      throw new Error("You can only edit your own messages");
    }

    return await messageRepository.editMessage(messageId, content);
  }

 async deleteMessage(messageId: string, userId: string) {
  const message = await messageRepository.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.sender.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  return await messageRepository.deleteMessage(messageId);
}
async seenMessage(messageId: string, userId: string) {
  const message = await messageRepository.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  return await messageRepository.seenMessage(
    messageId,
    userId
  );
}
// reactToMessagewithEmoji  
async reactToMessage(
  messageId: string,
  userId: string,
  emoji: string
) {
  if (!Types.ObjectId.isValid(messageId)) {
    throw new Error("Invalid message");
  }

  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user");
  }

  if (!emoji || emoji.trim().length === 0) {
    throw new Error("Emoji is required");
  }

  return await messageRepository.reactToMessage(
    messageId,
    userId,
    emoji
  );
}

}
