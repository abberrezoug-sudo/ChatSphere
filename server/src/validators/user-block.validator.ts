import { z } from "zod";

export const blockUserSchema = z.object({
  userId: z.string().min(1),
});

export const blockedUsersListSchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  before: z.string().optional(),
});
