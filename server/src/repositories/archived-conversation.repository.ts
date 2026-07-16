import { Types } from "mongoose";
import {
  ArchivedConversation,
  ArchivedConversationType,
} from "../models/archived-conversation.model.js";

export class ArchivedConversationRepository {
  async archivePrivate(userId: string, otherUserId: string) {
    return await ArchivedConversation.findOneAndUpdate(
      {
        user: new Types.ObjectId(userId),
        type: ArchivedConversationType.PRIVATE,
        otherUser: new Types.ObjectId(otherUserId),
      },
      {
        user: new Types.ObjectId(userId),
        type: ArchivedConversationType.PRIVATE,
        otherUser: new Types.ObjectId(otherUserId),
        room: null,
        archived: true,
        archivedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );
  }

  async archiveRoom(userId: string, roomId: string) {
    return await ArchivedConversation.findOneAndUpdate(
      {
        user: new Types.ObjectId(userId),
        type: ArchivedConversationType.ROOM,
        room: new Types.ObjectId(roomId),
      },
      {
        user: new Types.ObjectId(userId),
        type: ArchivedConversationType.ROOM,
        otherUser: null,
        room: new Types.ObjectId(roomId),
        archived: true,
        archivedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );
  }

  async restorePrivate(userId: string, otherUserId: string) {
    return await ArchivedConversation.findOneAndUpdate(
      {
        user: new Types.ObjectId(userId),
        type: ArchivedConversationType.PRIVATE,
        otherUser: new Types.ObjectId(otherUserId),
      },
      {
        archived: false,
      },
      {
        new: true,
      }
    );
  }

  async restoreRoom(userId: string, roomId: string) {
    return await ArchivedConversation.findOneAndUpdate(
      {
        user: new Types.ObjectId(userId),
        type: ArchivedConversationType.ROOM,
        room: new Types.ObjectId(roomId),
      },
      {
        archived: false,
      },
      {
        new: true,
      }
    );
  }

  async getArchivedForUser(userId: string) {
    return await ArchivedConversation.find({
      user: new Types.ObjectId(userId),
      archived: true,
    });
  }

  async getArchivedIds(userId: string) {
    const archives = await this.getArchivedForUser(userId);

    return {
      privateUserIds: new Set(
        archives
          .filter((archive) => archive.otherUser)
          .map((archive) => archive.otherUser!.toString())
      ),
      roomIds: new Set(
        archives
          .filter((archive) => archive.room)
          .map((archive) => archive.room!.toString())
      ),
    };
  }
}
