import { WebSocket } from "ws";
import { AuthSocket } from "../types/socket.js";
import { sendJson } from "../utils/sendJson.js";

const rooms = new Map<string, Set<WebSocket>>();

export const joinRoom = (
  roomName: string,
  socket: AuthSocket
): void => {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }

  rooms.get(roomName)!.add(socket);
  socket.rooms.add(roomName);

  console.log(`${socket.username} joined room ${roomName}`);
};

export const leaveRoom = (
  socket: AuthSocket,
  roomName: string
): void => {
  const room = rooms.get(roomName);

  if (!room) {
    socket.rooms.delete(roomName);
    return;
  }

  room.delete(socket);
  socket.rooms.delete(roomName);

  console.log(`${socket.username} left room ${roomName}`);

  if (room.size === 0) {
    rooms.delete(roomName);
    console.log(`Room ${roomName} deleted`);
  }
};

export const leaveAllRooms = (
  socket: AuthSocket
): void => {
  for (const roomName of Array.from(socket.rooms)) {
    leaveRoom(socket, roomName);
  }
};

export const getRoom = (
  roomName: string
): Set<WebSocket> | undefined => {
  return rooms.get(roomName);
};

export const getRooms = (): Map<string, Set<WebSocket>> => {
  return rooms;
};

export const broadcastToRoom = (
  roomId: string,
  payload: any,
  excludeSocket?: AuthSocket
) => {
  const room = rooms.get(roomId);

  if (!room) return;

  room.forEach((client) => {
    if (client !== excludeSocket) {
      client.send(JSON.stringify(payload));
    }
  });
};
