import { z } from "zod";

export const sendMessageSchema = z.object({
  type: z.literal("send-message"),
  room: z.string().min(1),
  content: z.string().trim().min(1),
});

export const joinRoomSchema = z.object({
  type: z.literal("join-room"),
  room: z.string().min(1),
});

export const leaveRoomSchema = z.object({
  type: z.literal("leave-room"),
  room: z.string().min(1),
});

export const roomHistorySchema = z.object({
  type: z.literal("room-history"),
  room: z.string().min(1),
});

export const editMessageSchema = z.object({
  type: z.literal("editMessage"),
  messageId: z.string().min(1),
  content: z.string().trim().min(1),
});

export const deleteMessageSchema = z.object({
  type: z.literal("delete-message"),
  messageId: z.string().min(1),
});

export const typingSchema = z.object({
  type: z.literal("typing"),
  room: z.string().min(1),
  isTyping: z.boolean(),
});

export const privateMessageSchema = z.object({
  type: z.literal("private-message"),
  to: z.string().trim().min(1),
  content: z.string().trim().min(1),
});
