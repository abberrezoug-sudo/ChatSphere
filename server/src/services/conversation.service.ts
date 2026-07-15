import { PrivateMessageRepository } from "../repositories/private-message.repository.js";
import { RoomRepository } from "../repositories/room.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";

const privateMessageRepository = new PrivateMessageRepository();
const roomRepository = new RoomRepository();
const messageRepository = new MessageRepository();

export class ConversationService {
  async getConversations(userId: string) {
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

      if (!privateMap.has(otherUser._id.toString())) {
        privateMap.set(otherUser._id.toString(), {
          type: "private",

          user: {
            _id: otherUser._id,
            username: otherUser.username,
            avatar: otherUser.avatar,
          },

          lastMessage: {
            _id: message._id,
            content: message.content,
            type: message.type,
            createdAt: message.createdAt,
          },

          createdAt: message.createdAt,

          unreadCount: 0,
        });
      }
    }

    const privateConversations = Array.from(privateMap.values());

    const rooms = await roomRepository.getUserRooms(userId);

    const roomConversations: any[] = [];

    for (const room of rooms) {
      const lastMessage =
        await messageRepository.getLastMessage(room._id.toString());

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

        unreadCount: 0,
      });
    }

    const conversations = [
      ...privateConversations,
      ...roomConversations,
    ].sort((a, b) => {
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });

    return conversations;
  }
}