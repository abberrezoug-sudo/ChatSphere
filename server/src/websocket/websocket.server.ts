import { Server } from "http";
import { WebSocketServer } from "ws";

import { handleConnection } from "../handlers/connection.handler.js";
import { User } from "../models/User.js";
import { AuthSocket } from "../types/socket.js";
import { authenticateSocket } from "./auth.websocket.js";

export const startWebSocketServer = (
  server: Server
) => {
  const wss = new WebSocketServer({
    server,
  });

  console.log("WebSocket Ready");

  wss.on("connection", async (socket, request) => {
    try {
      const userId = authenticateSocket(request);
      const user = await User.findById(userId);

      if (!user) {
        socket.close(1008, "User not found");
        return;
      }

      const authSocket = socket as AuthSocket;

      authSocket.userId = user.id;
      authSocket.username = user.username;
      authSocket.rooms = new Set<string>();

      console.log("Authenticated:", authSocket.username);

      handleConnection(authSocket);
    } catch {
      console.log("Unauthorized WebSocket");

      socket.close(1008, "Unauthorized");
    }
  });
};
