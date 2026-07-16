import { z } from "zod";

export const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Query is required")
    .max(100, "Query is too long"),
});

export type SearchPayload = z.infer<typeof searchSchema>;