import { RawData } from "ws";
import { AuthSocket } from "../types/socket.js";

import { addUser } from "../services/user.service.js";
import { joinRoom, broadcastToRoom } from "../services/room.service.js";
import { MessageService } from "../services/message.service.js";
import { promises } from "node:dns";

const messageService = new MessageService();
export const handleMessage = async (
  socket: AuthSocket,
  data: RawData
): Promise<void> => { 
  const message = data.toString();

  console.log("📩 Message reçu :", message);

  try {
    const payload = JSON.parse(message);

    console.log("📦 Payload :", payload);

    switch (payload.type) {
      case "join":
        addUser(socket, payload.username);

        console.log(`👤 ${payload.username} a rejoint le chat`);
        break;

     case "joinRoom": {
  joinRoom(payload.room, socket);

  console.log(
    `📁 ${socket.username} a rejoint le salon ${payload.room}`
  );

  const messages = await messageService.getRoomMessages(
    payload.room
  );

  socket.send(
    JSON.stringify({
      type: "history",
      room: payload.room,
      messages,
    })
  );

  break;
}

      case "message": {
  console.log(`${socket.username} : ${payload.message}`);

  const savedMessage = await messageService.sendMessage(
    socket.userId!,
    payload.room,
    payload.message
  );

  const response = {
    type: "message",
    message: savedMessage,
  };

  broadcastToRoom(
    payload.room,
    JSON.stringify(response)
  );

  break;
}
case "history": {
  const messages = await messageService.getRoomMessages(
    payload.room
  );

  socket.send(
    JSON.stringify({
      type: "history",
      room: payload.room,
      messages,
    })
  );

  break;
}
      default:
        console.log("❓ Type inconnu :", payload.type);
    }
    
  } catch (error) {
  console.error("Erreur :", error);
}
};