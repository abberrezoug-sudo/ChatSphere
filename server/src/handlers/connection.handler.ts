import { WebSocket } from "ws";
import { handleMessage } from "./message.handler.js";
import { handleClose } from "./close.handler.js";

export const handleConnection = (socket: WebSocket) => {
  console.log("✅ Client connecté");

  socket.send("Bienvenue sur ChatSphere !");

  socket.on("message", (data) => {
    handleMessage(socket, data);
  });

  socket.on("close", () => {
    handleClose(socket);
  });
};