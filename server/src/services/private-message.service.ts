import { WebSocket } from "ws";
import { getSocketByUsername } from "./user.service.js";
export const sendPrivateMessage =( to: string, message: string): void => {
      const receiver = getSocketByUsername(to);

  if (!receiver) {
    console.log(`❌ ${to} est hors ligne`);
    return;
  }

  if (receiver.readyState === WebSocket.OPEN) {
    receiver.send(message);

    console.log(`📨 Message privé envoyé à ${to}`);
  }
}