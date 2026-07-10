export interface JoinMessage {
  type: "join";
  username: string;
}

export interface ChatMessage {
  type: "message";
  username: string;
  message: string;
}

export interface LeaveMessage {
  type: "leave";
  username: string;
}

export type ClientMessage =
  | JoinMessage
  | ChatMessage
  | LeaveMessage;