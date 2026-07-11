export interface JoinMessage {
  type: "join";
}

export interface JoinRoomMessage {
  type: "joinRoom";
  room: string;
}

export interface LeaveRoomMessage {
  type: "leaveRoom";
  room: string;
}

export interface ChatMessage {
  type: "message";
  room: string;
  message: string;
}

export interface PrivateMessage {
  type: "private";
  to: string;
  message: string;
}

export type ClientMessage =
  | JoinMessage
  | JoinRoomMessage
  | LeaveRoomMessage
  | ChatMessage
  | PrivateMessage;
