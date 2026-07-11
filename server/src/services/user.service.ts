import { WebSocket } from "ws";

const users = new Map<WebSocket, string>();
const userSockets = new Map<string, WebSocket>();

export const addUser = (
  socket: WebSocket,
  username: string
): void => {
  users.set(socket, username);
  userSockets.set(username, socket);

  console.log(`${username} connected`);
};

export const removeUser = (
  socket: WebSocket
): void => {
  const username = users.get(socket);

  if (username) {
    userSockets.delete(username);
  }

  users.delete(socket);
};

export const getUsername = (
  socket: WebSocket
): string | undefined => {
  return users.get(socket);
};

export const getSocketByUsername = (
  username: string
): WebSocket | undefined => {
  return userSockets.get(username);
};

export const getOnlineCount = (): number => {
  return users.size;
};
