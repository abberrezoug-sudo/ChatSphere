import { WebSocket } from "ws";

export const sendJson = (
  socket: WebSocket,
  payload: unknown
): void => {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }

  socket.send(JSON.stringify(payload));
};
