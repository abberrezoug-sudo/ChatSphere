import { z } from "zod";

// NOTE: ce validateur suit exactement le style de `editMessageSchema`
// (validators/message.validator.ts). Si votre schéma de rooms utilise une
// autre lib que zod, adaptez ce fichier en conséquence.

export const editPrivateMessageSchema = z.object({
  type: z.literal("editPrivateMessage"),
  messageId: z.string().min(1, "messageId requis"),
  content: z.string().min(1, "content requis"),
});

export type EditPrivateMessageInput = z.infer<
  typeof editPrivateMessageSchema
>;

export const reactPrivateMessageSchema = z.object({
  type: z.literal("reactPrivateMessage"),
  messageId: z.string().min(1, "messageId requis"),
  emoji: z.string().min(1, "emoji requis"),
});

export type ReactPrivateMessageInput = z.infer<
  typeof reactPrivateMessageSchema
>;