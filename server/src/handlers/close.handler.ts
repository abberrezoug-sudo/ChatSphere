import { WebSocket } from "ws";

export const handleClose = (socket: WebSocket) => {
  console.log("❌ Client déconnecté");
};