import { WebSocket } from "ws";
export const joinRoom = (roomName: string, socket: WebSocket):void=>{
    //cheak existing room
    if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  //get room
    const room = rooms.get(roomName)!;
    //add client
     room.add(socket);

  console.log(`✅ Un utilisateur a rejoint ${roomName}`);
}
//quiter le salon
export const leaveRoom = (
  socket: WebSocket,
  roomName: string
): void => {

  const room = rooms.get(roomName);

  if (!room) return;

  room.delete(socket);

  console.log(`❌ Un utilisateur a quitté ${roomName}`);

  // Si le salon est vide, on le supprime
  if (room.size === 0) {
    rooms.delete(roomName);
    console.log(`🗑️ Salon ${roomName} supprimé`);
  }
};
//voi les mbr de salon 
export const getRoom = (
  roomName: string
): Set<WebSocket> | undefined => {
  return rooms.get(roomName);
};
//voir tout les salon 
export const getRooms = (): Map<string, Set<WebSocket>> => {
  return rooms;
};
// Map strctr for Chatroom
const rooms = new Map<string, Set<WebSocket>>();