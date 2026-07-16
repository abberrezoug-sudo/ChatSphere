import { RoomRepository } from "../repositories/room.repository.js";
import { RoomRole } from "../models/room.model.js";
import {
  RoomPermission,
  RoomPermissionService,
} from "./room-permission.service.js";

const roomRepository = new RoomRepository();
const roomPermissionService = new RoomPermissionService();

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
  const existingRoom = await roomRepository.findById(roomId);

  if (!existingRoom) {
    throw new Error("Room not found");
  }

  const isMember = existingRoom.members.some((member) => {
    return member.toString() === userId;
  });

  if (existingRoom.isPrivate && !isMember) {
    throw new Error("Invitation required to join this private room");
  }

  const room = await roomRepository.addMember(roomId, userId);

  if (!room) {
    throw new Error("Room not found");
  }

  return room;
}
async leaveRoom(roomId: string, userId: string) {
  const role = await roomPermissionService.getUserRole(roomId, userId);

  if (role === RoomRole.OWNER) {
    throw new Error("Owner must transfer ownership before leaving the room");
  }

  const room = await roomRepository.removeMember(roomId, userId);

  if (!room) {
    throw new Error("Room not found");
  }

  return room;
}
async removeUser(roomId: string, requesterId: string, userId: string) {
  await roomPermissionService.assertPermission(
    roomId,
    requesterId,
    RoomPermission.REMOVE_USERS
  );

  const targetRole = await roomPermissionService.getUserRole(roomId, userId);

  if (targetRole === RoomRole.OWNER) {
    throw new Error("Owner cannot be removed");
  }

  const room = await roomRepository.removeMember(roomId, userId);

  if (!room) {
    throw new Error("Room not found");
  }

  return room;
}
async setRole(
  roomId: string,
  requesterId: string,
  userId: string,
  role: RoomRole
) {
  await roomPermissionService.assertPermission(
    roomId,
    requesterId,
    RoomPermission.MANAGE_SETTINGS
  );

  if (role === RoomRole.OWNER) {
    throw new Error("Use transfer ownership to assign owner role");
  }

  return await roomRepository.setRole(roomId, userId, role);
}
async transferOwnership(
  roomId: string,
  ownerId: string,
  newOwnerId: string
) {
  await roomPermissionService.assertPermission(
    roomId,
    ownerId,
    RoomPermission.TRANSFER_OWNERSHIP
  );

  return await roomRepository.transferOwnership(
    roomId,
    ownerId,
    newOwnerId
  );
}
async updateSettings(
  roomId: string,
  requesterId: string,
  data: { name?: string; description?: string; isPrivate?: boolean }
) {
  await roomPermissionService.assertPermission(
    roomId,
    requesterId,
    RoomPermission.MANAGE_SETTINGS
  );

  return await roomRepository.updateSettings(roomId, data);
}
async deleteRoom(roomId: string, requesterId: string) {
  await roomPermissionService.assertPermission(
    roomId,
    requesterId,
    RoomPermission.DELETE_ROOM
  );

  return await roomRepository.deleteRoom(roomId);
}
}
