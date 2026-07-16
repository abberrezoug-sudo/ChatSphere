import { ConversationService } from "../services/conversation.service.js";
import { AuthSocket } from "../types/socket.js";
import { getConversationsSchema } from "../validators/conversation.validator.js";

const conversationService = new ConversationService();

export const handleGetConversations = async (
  socket: AuthSocket,
  payload: unknown = {}
) => {
  try {
    const result = getConversationsSchema.safeParse(payload);

    if (!result.success) {
      socket.send(
        JSON.stringify({
          type: "error",
          message: "Invalid get conversations payload",
        })
      );

      return;
    }

    const conversations = await conversationService.getConversations(
      socket.userId,
      result.data.limit ?? 20,
      result.data.before
    );

    socket.send(
      JSON.stringify({
        type: "conversations",
        conversations: conversations.conversations,
        hasMore: conversations.hasMore,
      })
    );
  } catch (error) {
    console.error(error);

    socket.send(
      JSON.stringify({
        type: "error",
        message: "Impossible de récupérer les conversations.",
      })
    );
  }
};
