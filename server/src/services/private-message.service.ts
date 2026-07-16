import { Types } from "mongoose";
import { PrivateMessageType } from "../models/private-message.model.js";
import { PrivateMessageRepository } from "../repositories/private-message.repository.js";
import { NotificationService } from "./notification.service.js";

const notificationService = new NotificationService();
const repository = new PrivateMessageRepository();

interface SendPrivateMessagePayload {
  sender: string;
  receiver: string;
  content: string;
  type?: PrivateMessageType;
  replyTo?: string | null;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

interface GetConversationOptions {
  limit?: number;
  before?: string;
}

export class PrivateMessageService {
  async send(data: SendPrivateMessagePayload) {
    if (!Types.ObjectId.isValid(data.sender)) {
      throw new Error("Invalid sender");
    }

    if (!Types.ObjectId.isValid(data.receiver)) {
      throw new Error("Invalid receiver");
    }

    if (data.replyTo && !Types.ObjectId.isValid(data.replyTo)) {
      throw new Error("Invalid replyTo");
    }

    return await repository.create({
      sender: new Types.ObjectId(data.sender),
      receiver: new Types.ObjectId(data.receiver),
      content: data.content,
      type: data.type ?? PrivateMessageType.TEXT,
      replyTo: data.replyTo ? new Types.ObjectId(data.replyTo) : null,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
    });
  }

  async getConversation(
    userId: string,
    withUserId: string,
    options: GetConversationOptions = {}
  ) {
    if (!Types.ObjectId.isValid(withUserId)) {
      throw new Error("Invalid conversation partner");
    }

    return await repository.findConversation(userId, withUserId, {
      limit: options.limit,
      before: options.before ? new Date(options.before) : undefined,
    });
  }

  /**
   * Vérifie que l'utilisateur est bien l'expéditeur ou le destinataire du
   * message (seuls les deux participants ont le droit d'agir dessus).
   */
  private async assertParticipant(messageId: string, userId: string) {
    const message = await repository.findByIdRaw(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    const isParticipant =
      message.sender.toString() === userId ||
      message.receiver.toString() === userId;

    if (!isParticipant) {
      throw new Error("Not authorized to access this message");
    }

    return message;
  }

  async editMessageForUser(messageId: string, userId: string, content: string) {
    const message = await repository.findByIdRaw(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.sender.toString() !== userId) {
      throw new Error("Only the sender can edit this message");
    }

    if (message.deleted) {
      throw new Error("Cannot edit a deleted message");
    }

    return await repository.editMessage(messageId, content);
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await repository.findByIdRaw(messageId);

    if (!message) {
      throw new Error("Message not found or already deleted");
    }

    if (message.sender.toString() !== userId) {
      throw new Error("Only the sender can delete this message");
    }

    return await repository.deleteMessage(messageId);
  }

  async seenMessage(messageId: string, userId: string) {
    const message = await this.assertParticipant(messageId, userId);

    if (message.sender.toString() === userId) {
      throw new Error("Sender cannot mark their own message as seen");
    }

    return await repository.seenMessage(messageId, userId);
  }

 async reactToMessage(messageId: string, userId: string, emoji: string) {
  const message = await this.assertParticipant(messageId, userId);

  const updatedMessage = await repository.reactToMessage(messageId, userId, emoji);

  let notification = null;

  if (message.sender.toString() !== userId) {
    notification = await notificationService.createReactionNotification(
      userId,
      message.sender.toString(),
      emoji
    );
  }

  return { message: updatedMessage, notification };
}
}