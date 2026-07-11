import { WebSocket } from "ws";

export interface AuthSocket extends WebSocket {
  userId: string;
  username: string;
  rooms: Set<string>;
}
