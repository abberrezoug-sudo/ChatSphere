import { RawData } from "ws";
import { z } from "zod";
import { AuthSocket } from "../types/socket.js";
import {
  broadcastToRoom,
  joinRoom,
  leaveRoom,
} from "../services/room.service.js";
import { sendPrivateMessage } from "../services/private-message.service.js";
import { sendJson } from "../utils/sendJson.js";

const messageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("join"),
  }),
  z.object({
    type: z.literal("joinRoom"),
    room: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal("leaveRoom"),
    room: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal("message"),
    room: z.string().trim().min(1),
    message: z.string().trim().min(1),
  }),
  z.object({
    type: z.literal("private"),
    to: z.string().trim().min(1),
    message: z.string().trim().min(1),
  }),
]);

export const handleMessage = (
  socket: AuthSocket,
  data: RawData
): void => {
  try {
    const payload = messageSchema.parse(
      JSON.parse(data.toString())
    );

    switch (payload.type) {
      case "join":
        sendJson(socket, {
          type: "joined",
          username: socket.username,
          userId: socket.userId,
        });
        break;

      case "joinRoom":
        joinRoom(payload.room, socket);

        sendJson(socket, {
          type: "roomJoined",
          room: payload.room,
        });
        break;

      case "leaveRoom":
        leaveRoom(socket, payload.room);

        sendJson(socket, {
          type: "roomLeft",
          room: payload.room,
        });
        break;

      case "message": {
        if (!socket.rooms.has(payload.room)) {
          sendJson(socket, {
            type: "error",
            message: `Join room ${payload.room} before sending messages`,
          });
          break;
        }

        const response = {
          type: "message",
          username: socket.username,
          userId: socket.userId,
          room: payload.room,
          message: payload.message,
          timestamp: new Date().toISOString(),
        };

        broadcastToRoom(payload.room, response);
        break;
      }

      case "private": {
        const response = {
          type: "private",
          username: socket.username,
          userId: socket.userId,
          message: payload.message,
          timestamp: new Date().toISOString(),
        };

        const sent = sendPrivateMessage(
          payload.to,
          response
        );

        if (!sent) {
          sendJson(socket, {
            type: "error",
            message: `${payload.to} is offline`,
          });
        }

        break;
      }
    }
  } catch {
    sendJson(socket, {
      type: "error",
      message: "Invalid message payload",
    });
  }
};
