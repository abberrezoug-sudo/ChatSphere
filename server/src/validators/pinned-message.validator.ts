import { z } from "zod";

export const pinMessageSchema = z.object({
  messageId: z.string().min(1),
  roomId: z.string().min(1),
});

export const unpinMessageSchema = z.object({
  messageId: z.string().min(1),
  roomId: z.string().min(1),
});

export const getPinnedMessagesSchema = z.object({
  roomId: z.string().min(1),
  limit: z.number().optional(),
  before: z.string().optional(),
});
