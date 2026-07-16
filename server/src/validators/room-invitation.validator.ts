import { z } from "zod";

export const inviteUserSchema = z.object({
  userId: z.string().min(1),
  expiresAt: z.string().min(1),
  maxUses: z.number().int().positive().optional(),
});

export const createInviteLinkSchema = z.object({
  expiresAt: z.string().min(1),
  maxUses: z.number().int().positive().optional(),
});

export const invitationTokenSchema = z.object({
  token: z.string().min(1),
});

export const invitationListSchema = z.object({
  limit: z.coerce.number().int().positive().optional(),
  before: z.string().optional(),
});
