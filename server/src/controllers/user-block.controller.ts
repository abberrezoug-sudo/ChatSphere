import { Request, Response } from "express";
import { ZodError } from "zod";
import { UserBlockService } from "../services/user-block.service.js";
import {
  blockedUsersListSchema,
  blockUserSchema,
} from "../validators/user-block.validator.js";

const userBlockService = new UserBlockService();

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join(", ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const data = blockUserSchema.parse(req.body);
    const block = await userBlockService.blockUser(req.user!.id, data.userId);

    res.status(201).json({
      success: true,
      message: "User blocked",
      block,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const block = await userBlockService.unblockUser(
      req.user!.id,
      String(req.params.userId)
    );

    res.status(200).json({
      success: true,
      message: "User unblocked",
      block,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const getBlockedUsers = async (req: Request, res: Response) => {
  try {
    const query = blockedUsersListSchema.parse(req.query);
    const result = await userBlockService.getBlockedUsers(
      req.user!.id,
      query.limit ?? 20,
      query.before
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
