import { handleClose } from "./close.handler.js";
import { handleMessage } from "./message.handler.js";
import { addUser } from "../services/user.service.js";
import { AuthSocket } from "../types/socket.js";
import { sendJson } from "../utils/sendJson.js";

export const handleConnection = (socket: AuthSocket) => {
  addUser(socket, socket.username);

  console.log("Client connected:", socket.username);

  sendJson(socket, {
    type: "connected",
    message: "Bienvenue sur ChatSphere !",
    user: {
      id: socket.userId,
      username: socket.username,
    },
  });

  socket.on("message", (data) => {
    handleMessage(socket, data);
  });

  socket.on("close", () => {
    handleClose(socket);
  });
};
