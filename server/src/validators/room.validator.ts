import { z } from "zod";
export const roomHistorySchema = z.object({
  roomId: z.string(),

  limit: z.number().optional(),

  before: z.string().optional(),
});