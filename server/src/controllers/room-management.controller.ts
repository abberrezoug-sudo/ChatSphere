import { Request, Response } from "express";
import { ZodError } from "zod";
import { RoomService } from "../services/room-db.service.js";
import {
  removeRoomUserSchema,
  setRoomRoleSchema,
  transferOwnershipSchema,
  updateRoomSettingsSchema,
} from "../validators/room-management.validator.js";

const roomService = new RoomService();

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join(", ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
};

export const updateRoomSettings = async (req: Request, res: Response) => {
  try {
    const data = updateRoomSettingsSchema.parse(req.body);
    const room = await roomService.updateSettings(
      String(req.params.roomId),
      req.user!.id,
      data
    );

    res.status(200).json({
      success: true,
      message: "Room settings updated",
      room,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const setRoomRole = async (req: Request, res: Response) => {
  try {
    const data = setRoomRoleSchema.parse(req.body);
    const room = await roomService.setRole(
      String(req.params.roomId),
      req.user!.id,
      data.userId,
      data.role
    );

    res.status(200).json({
      success: true,
      message: "Room role updated",
      room,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const transferOwnership = async (req: Request, res: Response) => {
  try {
    const data = transferOwnershipSchema.parse(req.body);
    const room = await roomService.transferOwnership(
      String(req.params.roomId),
      req.user!.id,
      data.userId
    );

    res.status(200).json({
      success: true,
      message: "Room ownership transferred",
      room,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const removeRoomUser = async (req: Request, res: Response) => {
  try {
    const data = removeRoomUserSchema.parse(req.body);
    const room = await roomService.removeUser(
      String(req.params.roomId),
      req.user!.id,
      data.userId
    );

    res.status(200).json({
      success: true,
      message: "User removed from room",
      room,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const room = await roomService.deleteRoom(
      String(req.params.roomId),
      req.user!.id
    );

    res.status(200).json({
      success: true,
      message: "Room deleted",
      room,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: getErrorMessage(error),
    });
  }
};
