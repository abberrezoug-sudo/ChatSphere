import { Types } from "mongoose";
import { ArchivedConversationType } from "../models/archived-conversation.model.js";
import { ArchivedConversationRepository } from "../repositories/archived-conversation.repository.js";

const archivedConversationRepository =
  new ArchivedConversationRepository();

export class ArchivedConversationService {
  async archiveConversation(data: {
    userId: string;
    type: ArchivedConversationType;
    otherUserId?: string;
    roomId?: string;
  }) {
    this.validatePayload(data);

    if (data.type === ArchivedConversationType.PRIVATE) {
      return await archivedConversationRepository.archivePrivate(
        data.userId,
        data.otherUserId!
      );
    }

    return await archivedConversationRepository.archiveRoom(
      data.userId,
      data.roomId!
    );
  }

  async restoreConversation(data: {
    userId: string;
    type: ArchivedConversationType;
    otherUserId?: string;
    roomId?: string;
  }) {
    this.validatePayload(data);

    if (data.type === ArchivedConversationType.PRIVATE) {
      return await archivedConversationRepository.restorePrivate(
        data.userId,
        data.otherUserId!
      );
    }

    return await archivedConversationRepository.restoreRoom(
      data.userId,
      data.roomId!
    );
  }

  async getArchivedIds(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user");
    }

    return await archivedConversationRepository.getArchivedIds(userId);
  }

  private validatePayload(data: {
    userId: string;
    type: ArchivedConversationType;
    otherUserId?: string;
    roomId?: string;
  }) {
    if (!Types.ObjectId.isValid(data.userId)) {
      throw new Error("Invalid user");
    }

    if (
      data.type === ArchivedConversationType.PRIVATE &&
      !Types.ObjectId.isValid(data.otherUserId ?? "")
    ) {
      throw new Error("Invalid private conversation user");
    }

    if (
      data.type === ArchivedConversationType.ROOM &&
      !Types.ObjectId.isValid(data.roomId ?? "")
    ) {
      throw new Error("Invalid room");
    }
  }
}
