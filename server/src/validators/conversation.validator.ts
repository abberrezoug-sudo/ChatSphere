import { z } from "zod";

export const getConversationsSchema = z.object({
  limit: z.number().optional(),
  before: z.string().optional(),
});
