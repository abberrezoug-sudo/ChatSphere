import { Server } from "http";
import { WebSocketServer } from "ws";
import { handleConnection } from "../handlers/connection.handler.js";
import { AuthSocket } from "../types/socket.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

export const startWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ server });

  console.log("✅ WebSocket initialisé");

  wss.on("connection", async (socket, request) => {
    try {
      const url = new URL(
        request.url!,
        `http://${request.headers.host}`
      );

      const token = url.searchParams.get("token");

      if (!token) {
        console.log("❌ Unauthorized WebSocket");
        socket.close();
        return;
      }

      const payload = verifyAccessToken(token);

      const user = await User.findById(payload.userId);

      if (!user) {
        console.log("❌ User not found");
        socket.close();
        return;
      }

      const authSocket = socket as AuthSocket;

      authSocket.userId = user._id.toString();
      authSocket.username = user.username;

      console.log(`Authenticated: ${user.username}`);
      console.log(`${user.username} connected`);

      handleConnection(authSocket);
    } catch (error) {
      console.log("❌ Unauthorized WebSocket");
      socket.close();
    }
  });
};