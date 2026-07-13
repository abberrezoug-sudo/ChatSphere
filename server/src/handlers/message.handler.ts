import { RawData } from "ws";
import { AuthSocket } from "../types/socket.js";

import { addUser } from "../services/user.service.js";
import { joinRoom, broadcastToRoom, leaveRoom } from "../services/room.service.js";
import { MessageService } from "../services/message.service.js";
import { RoomService } from "../services/room-db.service.js";
import { editMessageSchema } from "../validators/message.validator.js";

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
    payload.roomId,
    socket.userId!
  );

  // Ajouter le socket dans la room WebSocket
  joinRoom(payload.roomId, socket);

  console.log(
    `📁 ${socket.username} a rejoint le salon ${payload.room}`
  );

  // Envoyer l'historique
  const messages = await messageService.getRoomMessages(
    payload.roomId
  );

  socket.send(
    JSON.stringify({
      type: "history",
      room: payload.roomId,
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
      case "editMessage": {
        const result = editMessageSchema.safeParse(payload);

        if (!result.success) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Invalid edit message payload",
            })
          );

          break;
        }

        try {
          const editedMessage = await messageService.editMessageForUser(
            result.data.messageId,
            socket.userId!,
            result.data.content
          );

          if (!editedMessage?.room) {
            throw new Error("Message room not found");
          }

          broadcastToRoom(
            editedMessage.room.toString(), {
            type: "messageEdited",
            message: editedMessage,
          });
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to edit message",
            })
          );
        }

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
