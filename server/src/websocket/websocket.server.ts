import { Server } from "http";
import { WebSocketServer } from "ws";
import { handleConnection } from "../handlers/connection.handler.js";

export const startWebSocketServer = (
  server: Server
) => {

  const wss = new WebSocketServer({
    server
  });

  console.log("✅ WebSocket initialisé");

  wss.on("connection", handleConnection);
};