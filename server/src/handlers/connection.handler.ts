import { handleMessage } from "./message.handler.js";
import { handleClose } from "./close.handler.js";
import { AuthSocket } from "../types/socket.js";

export const handleConnection = (socket: AuthSocket) => {
  console.log("✅ Client connecté");

  socket.send("Bienvenue sur ChatSphere !");

  socket.on("message", (data) => {
    handleMessage(socket, data);
  });

  socket.on("close", () => {
    handleClose(socket);
  });
};