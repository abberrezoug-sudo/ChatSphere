import { handleMessage } from "./message.handler.js";
import { handleClose } from "./close.handler.js";
import { AuthSocket } from "../types/socket.js";
import { addUser } from "../services/user.service.js";

export const handleConnection = (socket: AuthSocket) => {
  console.log("✅ Client connecté");

  if (socket.userId) {
    addUser(socket, socket.userId);

    console.log(
      `🟢 ${socket.username} (${socket.userId}) est en ligne`
    );
  }

  socket.send("Bienvenue sur ChatSphere !");

  socket.on("message", (data) => {
    handleMessage(socket, data);
  });

  socket.on("close", () => {
    handleClose(socket);
  });
};