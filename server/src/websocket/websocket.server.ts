import { WebSocketServer } from "ws";
import { handleConnection } from "../handlers/connection.handler.js";

export const startWebSocketServer = () => {
  const wss = new WebSocketServer({
    port: 8080,
  });

  console.log("🚀 WebSocket Server running on ws://localhost:8080");

  wss.on("connection", handleConnection);
};