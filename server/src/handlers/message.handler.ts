import { RawData, WebSocket } from "ws";
import { addUser} from "../services/user.service.js";
import { joinRoom } from "../services/room.service.js";
;
export const handleMessage = (
  socket: WebSocket,
  data: RawData
) => {
  const message = data.toString();

  console.log("📩 Message reçu :", message);

  try {
    const payload = JSON.parse(message);

    console.log("📦 Payload :", payload);

    switch (payload.type) {
      case "join":
        addUser(socket, payload.username);
        console.log(`${payload.username} a rejoint le chat`);
        break;

      case "message":
        console.log(`${payload.username} : ${payload.message}`);
        break;
      case "joinRoom":
        joinRoom(payload.room, socket);
        console.log(`${payload.username} a rejoint le salon ${payload.room}`);
        break;
      default:
        console.log("❓ Type inconnu :", payload.type);
    }
  } catch (error) {
    console.log("❌ JSON invalide");
  }
};