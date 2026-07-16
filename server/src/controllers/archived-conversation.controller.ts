import { Request, Response } from "express";
import { ZodError } from "zod";
import { ArchivedConversationService } from "../services/archived-conversation.service.js";
import { ConversationService } from "../services/conversation.service.js";
import {
  archiveConversationSchema,
  archivedConversationListSchema,
} from "../validators/archived-conversation.validator.js";

const archivedConversationService = new ArchivedConversationService();
const conversationService = new ConversationService();

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join(", ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
};

export const archiveConversation = async (req: Request, res: Response) => {
  try {
    const data = archiveConversationSchema.parse(req.body);
    const archive = await archivedConversationService.archiveConversation({
      userId: req.user!.id,
      type: data.type,
      otherUserId: data.otherUserId,
      roomId: data.roomId,
    });

    res.status(200).json({
      success: true,
      message: "Conversation archived",
      archive,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const restoreConversation = async (req: Request, res: Response) => {
  try {
    const data = archiveConversationSchema.parse(req.body);
    const archive = await archivedConversationService.restoreConversation({
      userId: req.user!.id,
      type: data.type,
      otherUserId: data.otherUserId,
      roomId: data.roomId,
    });

    res.status(200).json({
      success: true,
      message: "Conversation restored",
      archive,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getArchivedConversations = async (
  req: Request,
  res: Response
) => {
  try {
    const query = archivedConversationListSchema.parse(req.query);
    const result = await conversationService.getConversations(
      req.user!.id,
      query.limit ?? 20,
      query.before,
      true
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
