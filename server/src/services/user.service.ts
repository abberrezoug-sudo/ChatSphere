import { WebSocket } from "ws";

// socket -> username
const users = new Map<WebSocket, string>();

// username -> socket
const userSockets = new Map<string, WebSocket>();

export const addUser = (
  socket: WebSocket,
  username: string
): void => {

  users.set(socket, username);
  userSockets.set(username, socket);

  console.log(`👤 ${username} connecté`);
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