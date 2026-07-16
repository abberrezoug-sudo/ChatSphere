import { z } from "zod";
import { ArchivedConversationType } from "../models/archived-conversation.model.js";

export const archiveConversationSchema = z.object({
  type: z.enum([
    ArchivedConversationType.PRIVATE,
    ArchivedConversationType.ROOM,
  ]),
  otherUserId: z.string().optional(),
  roomId: z.string().optional(),
});

export const archivedConversationListSchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  before: z.string().optional(),
});
