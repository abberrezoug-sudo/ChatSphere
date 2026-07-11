import { WebSocket } from "ws";

// roomName -> Set<WebSocket>
const rooms = new Map<string, Set<WebSocket>>();

export const joinRoom = (
  roomName: string,
  socket: WebSocket
): void => {

  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }

  const room = rooms.get(roomName)!;

  room.add(socket);

  console.log(`✅ Un utilisateur a rejoint ${roomName}`);
};

export const leaveRoom = (
  socket: WebSocket,
  roomName: string
): void => {

  const room = rooms.get(roomName);

  if (!room) return;

  room.delete(socket);

  console.log(`❌ Un utilisateur a quitté ${roomName}`);

  if (room.size === 0) {
    rooms.delete(roomName);
    console.log(`🗑️ Salon ${roomName} supprimé`);
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
  roomName: string,
  message: string
): void => {

  const room = rooms.get(roomName);

  if (!room) {
    console.log(`❌ Le salon ${roomName} n'existe pas`);
    return;
  }

  room.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });

  console.log(`📤 Message envoyé au salon ${roomName}`);
};