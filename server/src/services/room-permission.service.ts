import { Types } from "mongoose";
import { RoomRole } from "../models/room.model.js";
import { RoomRepository } from "../repositories/room.repository.js";

export enum RoomPermission {
  TRANSFER_OWNERSHIP = "transfer_ownership",
  DELETE_ROOM = "delete_room",
  INVITE_USERS = "invite_users",
  REMOVE_USERS = "remove_users",
  PIN_MESSAGES = "pin_messages",
  MANAGE_SETTINGS = "manage_settings",
  DELETE_MESSAGES = "delete_messages",
  MUTE_USERS = "mute_users",
  SEND_MESSAGES = "send_messages",
}

const permissionByRole: Record<RoomRole, RoomPermission[]> = {
  [RoomRole.OWNER]: Object.values(RoomPermission),
  [RoomRole.ADMIN]: [
    RoomPermission.INVITE_USERS,
    RoomPermission.REMOVE_USERS,
    RoomPermission.PIN_MESSAGES,
    RoomPermission.MANAGE_SETTINGS,
    RoomPermission.SEND_MESSAGES,
  ],
  [RoomRole.MODERATOR]: [
    RoomPermission.DELETE_MESSAGES,
    RoomPermission.PIN_MESSAGES,
    RoomPermission.MUTE_USERS,
    RoomPermission.SEND_MESSAGES,
  ],
  [RoomRole.MEMBER]: [RoomPermission.SEND_MESSAGES],
};

const roomRepository = new RoomRepository();

export class RoomPermissionService {
  async getUserRole(roomId: string, userId: string): Promise<RoomRole | null> {
    if (!Types.ObjectId.isValid(roomId) || !Types.ObjectId.isValid(userId)) {
      return null;
    }

    const room = await roomRepository.findById(roomId);

    if (!room) {
      return null;
    }

    if (room.owner.toString() === userId) {
      return RoomRole.OWNER;
    }

    const roleEntry = room.roles.find((role) => {
      return role.user.toString() === userId;
    });

    if (roleEntry) {
      return roleEntry.role;
    }

    const isMember = room.members.some((member) => {
      return member.toString() === userId;
    });

    return isMember ? RoomRole.MEMBER : null;
  }

  async hasPermission(
    roomId: string,
    userId: string,
    permission: RoomPermission
  ): Promise<boolean> {
    const role = await this.getUserRole(roomId, userId);

    if (!role) {
      return false;
    }

    return permissionByRole[role].includes(permission);
  }

  async assertPermission(
    roomId: string,
    userId: string,
    permission: RoomPermission
  ) {
    const allowed = await this.hasPermission(roomId, userId, permission);

    if (!allowed) {
      throw new Error("Insufficient room permission");
    }
  }
}
