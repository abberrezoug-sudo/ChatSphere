import { z } from "zod";
import { RoomRole } from "../models/room.model.js";

export const updateRoomSettingsSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().optional(),
});

export const setRoomRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum([
    RoomRole.ADMIN,
    RoomRole.MODERATOR,
    RoomRole.MEMBER,
  ]),
});

export const transferOwnershipSchema = z.object({
  userId: z.string().min(1),
});

export const removeRoomUserSchema = z.object({
  userId: z.string().min(1),
});
