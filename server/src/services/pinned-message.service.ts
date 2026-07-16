import { Types } from "mongoose";
import { PinnedMessageRepository } from "../repositories/pinned-message.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";

const pinnedMessageRepository = new PinnedMessageRepository();
const messageRepository = new MessageRepository();

export class PinnedMessageService {
  async pinMessage(messageId: string, roomId: string, userId: string) {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new Error("Invalid message");
    }

    if (!Types.ObjectId.isValid(roomId)) {
      throw new Error("Invalid room");
    }

    const message = await messageRepository.findByIdRaw(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.deleted) {
      throw new Error("Cannot pin a deleted message");
    }

    if (message.room.toString() !== roomId) {
      throw new Error("Message does not belong to this room");
    }

    const existing = await pinnedMessageRepository.findActivePin(messageId);

    if (existing) {
      throw new Error("Message is already pinned");
    }

    return await pinnedMessageRepository.pin(messageId, roomId, userId);
  }

  async unpinMessage(messageId: string, roomId: string) {
    if (!Types.ObjectId.isValid(messageId)) {
      throw new Error("Invalid message");
    }

    const existing = await pinnedMessageRepository.findActivePin(messageId);

    if (!existing) {
      throw new Error("Message is not pinned");
    }

    if (existing.room.toString() !== roomId) {
      throw new Error("Message does not belong to this room");
    }

    return await pinnedMessageRepository.unpin(existing.id);
  }

  async getPinnedMessages(roomId: string, limit = 20, before?: string) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new Error("Invalid room");
    }

    return await pinnedMessageRepository.getPinnedMessages(
      roomId,
      limit,
      before
    );
  }
}
