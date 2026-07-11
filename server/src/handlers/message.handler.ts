import { RawData } from "ws";
import { AuthSocket } from "../types/socket.js";

import { addUser } from "../services/user.service.js";
import { joinRoom, broadcastToRoom } from "../services/room.service.js";
export const handleMessage = (
  socket: AuthSocket,
  data: RawData
): void => {
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

      case "joinRoom":
        joinRoom(payload.room, socket);

        console.log(
          `📁 ${payload.username} a rejoint le salon ${payload.room}`
        );
        break;

      case "message": {
        console.log(`${payload.username} : ${payload.message}`);

        const response = {
          type: "message",
          username: payload.username,
          room: payload.room,
          message: payload.message,
          timestamp: new Date().toISOString(),
        };

        broadcastToRoom(
          payload.room,
          JSON.stringify(response)
        );

        break;
      }

      default:
        console.log("❓ Type inconnu :", payload.type);
    }
  } catch (error) {
    console.error("❌ JSON invalide");
  }
};