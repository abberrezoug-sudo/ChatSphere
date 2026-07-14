import { z } from "zod";

export const sendMessageSchema = z.object({
  room: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export const editMessageSchema = z.object({
  messageId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export const deleteMessageSchema = z.object({
  messageId: z.string().min(1),
});

export const joinRoomSchema = z.object({
  room: z.string().min(1),
});

export const leaveRoomSchema = z.object({
  room: z.string().min(1),
});