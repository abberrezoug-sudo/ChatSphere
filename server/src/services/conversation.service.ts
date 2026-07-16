import { PrivateMessageRepository } from "../repositories/private-message.repository.js";
import { RoomRepository } from "../repositories/room.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { isOnline } from "./user.service.js";
import { ArchivedConversationService } from "./archived-conversation.service.js";
const privateMessageRepository = new PrivateMessageRepository();
const roomRepository = new RoomRepository();
const messageRepository = new MessageRepository();
const archivedConversationService = new ArchivedConversationService();

export class ConversationService {
  async getConversations(
    userId: string,
    limit = 20,
    before?: string,
    archivedOnly = false
  ) {
    const archivedIds = await archivedConversationService.getArchivedIds(userId);
    const privateMessages =
      await privateMessageRepository.getUserMessages(userId);

    const privateMap = new Map<string, any>();

    for (const message of privateMessages) {
      const sender = message.sender as any;
      const receiver = message.receiver as any;

      const otherUser =
        sender._id.toString() === userId
          ? receiver
          : sender;

      const isArchived = archivedIds.privateUserIds.has(
        otherUser._id.toString()
      );

      if (!archivedOnly && isArchived) {
        continue;
      }

      if (archivedOnly && !isArchived) {
        continue;
      }

      if (!privateMap.has(otherUser._id.toString())) {

        const unreadCount =
          await privateMessageRepository.countUnreadMessages(
            userId,
            otherUser._id.toString()
          );

        privateMap.set(otherUser._id.toString(), {
          type: "private",

          user: {
            _id: otherUser._id,
            username: otherUser.username,
            avatar: otherUser.avatar,
             online: isOnline(otherUser._id.toString())
          },

          lastMessage: {
            _id: message._id,
            content: message.content,
            type: message.type,
            createdAt: message.createdAt,
          },

          createdAt: message.createdAt,

          unreadCount,
        });
      }
    }

    const privateConversations = Array.from(privateMap.values());

    const rooms = await roomRepository.getUserRooms(userId);

    const roomConversations: any[] = [];

    for (const room of rooms) {
      const isArchived = archivedIds.roomIds.has(room._id.toString());

      if (!archivedOnly && isArchived) {
        continue;
      }

      if (archivedOnly && !isArchived) {
        continue;
      }

      const lastMessage =
        await messageRepository.getLastMessage(room._id.toString());

      const unreadCount =
        await messageRepository.countUnreadRoomMessages(
          room._id.toString(),
          userId
        );

      roomConversations.push({
        type: "room",

        room: {
          _id: room._id,
          name: room.name,
          description: room.description,
        },

        lastMessage: lastMessage
          ? {
              _id: lastMessage._id,
              content: lastMessage.content,
              type: lastMessage.type,
              createdAt: lastMessage.createdAt,
            }
          : null,

        createdAt: lastMessage?.createdAt ?? room.createdAt,

        unreadCount,
      });
    }

    let conversations = [
      ...privateConversations,
      ...roomConversations,
    ].sort((a, b) => {
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });

    if (before) {
      conversations = conversations.filter((conversation) => {
        return (
          new Date(conversation.createdAt).getTime() <
          new Date(before).getTime()
        );
      });
    }

    const hasMore = conversations.length > limit;

    return {
      conversations: hasMore
        ? conversations.slice(0, limit)
        : conversations,

      hasMore,
    };
  }
}
