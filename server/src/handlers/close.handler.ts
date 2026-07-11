import { leaveAllRooms } from "../services/room.service.js";
import {
  getOnlineCount,
  removeUser,
} from "../services/user.service.js";
import { AuthSocket } from "../types/socket.js";

export const handleClose = (socket: AuthSocket) => {
  leaveAllRooms(socket);
  removeUser(socket);

  console.log("Online:", getOnlineCount());
  console.log("Client disconnected:", socket.username);
};
