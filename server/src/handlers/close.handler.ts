import { WebSocket } from "ws";
import { removeUser ,getOnlineCount} from "../services/user.service.js";
export const handleClose = (socket: WebSocket) => {
  removeUser(socket);
  console.log("👥 En ligne :", getOnlineCount());
  console.log("❌ Client déconnecté");
};