import { RawData, WebSocket } from "ws";
import { addUser} from "../services/user.service.js";
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

      default:
        console.log("❓ Type inconnu :", payload.type);
    }
  } catch (error) {
    console.log("❌ JSON invalide");
  }
};