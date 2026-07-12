import { RawData } from "ws";
import { AuthSocket } from "../types/socket.js";

import { addUser } from "../services/user.service.js";
import { joinRoom, broadcastToRoom, leaveRoom } from "../services/room.service.js";
import { MessageService } from "../services/message.service.js";
import { RoomService } from "../services/room-db.service.js";

const messageService = new MessageService();
const roomService = new RoomService();

export const handleMessage = async (
  socket: AuthSocket,
  data: RawData
): Promise<void> => {
  try {
    const payload = JSON.parse(data.toString());

    console.log("📦 Payload :", payload);

    switch (payload.type) {
      case "join": {
        addUser(socket, payload.username);

        console.log(`👤 ${payload.username} a rejoint le chat`);
        break;
      }

      case "createRoom": {
        const room = await roomService.createRoom(
          socket.userId!,
          payload.name,
          payload.description ?? ""
        );

        socket.send(
          JSON.stringify({
            type: "roomCreated",
            room,
          })
        );

        console.log(`✅ Room créée : ${room.name}`);

        break;
      }

      case "rooms": {
        const rooms = await roomService.getRooms();

        socket.send(
          JSON.stringify({
            type: "rooms",
            rooms,
          })
        );

        break;
      }

      case "joinRoom": {
  // Ajouter le membre dans MongoDB
  await roomService.joinRoom(
    payload.room,
    socket.userId!
  );

  // Ajouter le socket dans la room WebSocket
  joinRoom(payload.room, socket);

  console.log(
    `📁 ${socket.username} a rejoint le salon ${payload.room}`
  );

  // Envoyer l'historique
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

        broadcastToRoom(payload.room, {
          type: "message",
          message: savedMessage,
        });

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
case "leaveRoom": {
  await roomService.leaveRoom(
    payload.room,
    socket.userId!
  );

  leaveRoom(socket, payload.room);

  socket.send(
    JSON.stringify({
      type: "roomLeft",
      room: payload.room,
    })
  );

  console.log(
    `${socket.username} a quitté ${payload.room}`
  );

  break;
}
      default:
        console.log("❓ Type inconnu :", payload.type);
    }
  } catch (error) {
    console.error("❌ WebSocket Error:", error);
  }
};