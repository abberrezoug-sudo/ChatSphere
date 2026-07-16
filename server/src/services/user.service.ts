import { AuthSocket } from "../types/socket.js";

const users = new Map<AuthSocket, string>();
const userSockets = new Map<string, AuthSocket>();
const onlineUsers = new Map<string, AuthSocket>();
export const addUser = (
  socket: AuthSocket,
  userId: string
): void => {
  users.set(socket, userId);

  userSockets.set(userId, socket);

  onlineUsers.set(userId, socket);

  console.log(`${socket.username} connected`);
}

export const removeUser = (
  socket: AuthSocket
): void => {

  const userId = users.get(socket);

  if (userId) {

    userSockets.delete(userId);

    onlineUsers.delete(userId);

  }

  users.delete(socket);

}

export const getUserId = (
  socket: AuthSocket
): string | undefined => {
  return users.get(socket);
};

export const getSocketByUserId = (
  userId: string
): AuthSocket | undefined => {

  console.log("Recherche :", userId);

  console.log(
    "Sockets enregistrés :",
    [...userSockets.keys()]
  );

  return userSockets.get(userId);

}

export const getOnlineCount = (): number => {
  return users.size;
};
//Online user
export const isOnline = (userId: string) => {
  return onlineUsers.has(userId);
};

export const getOnlineUsers = () => {
  return [...onlineUsers.keys()];
};