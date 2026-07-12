import { RoomRepository } from "../repositories/room.repository.js";

const roomRepository = new RoomRepository();

export class RoomService {
  async createRoom(
    owner: string,
    name: string,
    description = ""
  ) {
    const exists = await roomRepository.findByName(name);

    if (exists) {
      throw new Error("Room already exists");
    }

    return await roomRepository.create({
      owner,
      name,
      description,
    });
  }

  async getRooms() {
    return await roomRepository.findAll();
  }
  async joinRoom(roomId: string, userId: string) {
  const room = await roomRepository.addMember(roomId, userId);

  if (!room) {
    throw new Error("Room not found");
  }

  return room;
}
async leaveRoom(roomId: string, userId: string) {
  const room = await roomRepository.removeMember(roomId, userId);

  if (!room) {
    throw new Error("Room not found");
  }

  return room;
}
}