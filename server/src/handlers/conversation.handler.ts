import { ConversationService } from "../services/conversation.service.js";
import { AuthSocket } from "../types/socket.js";

const conversationService = new ConversationService();

export const handleGetConversations = async (
  socket: AuthSocket
) => {
  try {
    const conversations = await conversationService.getConversations(
      socket.userId
    );

    socket.send(
      JSON.stringify({
        type: "conversations",
        conversations,
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