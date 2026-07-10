import { WebSocketServer, WebSocket } from "ws";

export const broadcast = (
  wss: WebSocketServer,
  message: string
): void => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};