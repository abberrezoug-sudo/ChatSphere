import { RawData } from "ws";
import { AuthSocket } from "../types/socket.js";

import { addUser, getSocketByUserId } from "../services/user.service.js";
import { joinRoom, broadcastToRoom, leaveRoom } from "../services/room.service.js";
import { MessageService } from "../services/message.service.js";
import { RoomService } from "../services/room-db.service.js";
import { editMessageSchema } from "../validators/message.validator.js";
import { PrivateMessageService } from "../services/private-message.service.js";
import {
  editPrivateMessageSchema,
  reactPrivateMessageSchema,
} from "../validators/Private.message.validator.js";
import { handleGetConversations } from "./conversation.handler.js";
const messageService = new MessageService();
const roomService = new RoomService();
const privateMessageService = new PrivateMessageService();

// Le chat privé n'a pas de "room" WebSocket à broadcaster : on envoie donc
// directement au(x) socket(s) des participants concernés.
const sendToUser = (userId: string, payload: unknown) => {
  const target = getSocketByUserId(userId);

  if (target) {
    target.send(JSON.stringify(payload));
  }
};

// Les documents populés renvoient un objet (avec _id), les documents bruts
// renvoient directement un ObjectId. Ce helper gère les deux cas.
const idOf = (value: any): string =>
  value?._id?.toString?.() ?? value?.toString?.() ?? String(value);

export const handleMessage = async (
  socket: AuthSocket,
  data: RawData
): Promise<void> => {
  try {
    const payload = JSON.parse(data.toString());

    console.log("📦 Payload :", payload);

    switch (payload.type) {
      case "join": {
        addUser(socket, payload.username);

        console.log(`👤 ${payload.username} a rejoint le chat`);
        break;
      }

      case "createRoom": {
        const room = await roomService.createRoom(
          socket.userId!,
          payload.name,
          payload.description ?? ""
        );

        socket.send(
          JSON.stringify({
            type: "roomCreated",
            room,
          })
        );

        console.log(`✅ Room créée : ${room.name}`);

        break;
      }

      case "rooms": {
        const rooms = await roomService.getRooms();

        socket.send(
          JSON.stringify({
            type: "rooms",
            rooms,
          })
        );

        break;
      }

      case "joinRoom": {
        // Ajouter le membre dans MongoDB
        await roomService.joinRoom(
          payload.roomId,
          socket.userId!
        );

        // Ajouter le socket dans la room WebSocket
        joinRoom(payload.roomId, socket);

        console.log(
          `📁 ${socket.username} a rejoint le salon ${payload.room}`
        );

        // Envoyer l'historique
        const messages = await messageService.getRoomMessages(
          payload.roomId
        );

        socket.send(
          JSON.stringify({
            type: "history",
            room: payload.roomId,
            messages,
          })
        );

        break;
      }

      case "message": {
        console.log(`${socket.username} : ${payload.message}`);
        console.log({
          userId: socket.userId,
          room: payload.room,
          message: payload.message,
          replyTo: payload.replyTo,
        });
        const savedMessage = await messageService.sendMessage({
          sender: socket.userId!,
          room: payload.room,

          content: payload.content,

          type: payload.typeMessage,

          replyTo: payload.replyTo,

          fileUrl: payload.fileUrl,
          fileName: payload.fileName,
          fileSize: payload.fileSize,
          mimeType: payload.mimeType,
        });

        broadcastToRoom(payload.room, {
          type: "message",
          message: savedMessage,
        });

        break;
      }

      case "history": {
        const messages = await messageService.getRoomMessages(
          payload.room
        );

        socket.send(
          JSON.stringify({
            type: "history",
            room: payload.room,
            messages,
          })
        );

        break;
      }
      case "editMessage": {
        const result = editMessageSchema.safeParse(payload);

        if (!result.success) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Invalid edit message payload",
            })
          );

          break;
        }

        try {
          const editedMessage = await messageService.editMessageForUser(
            result.data.messageId,
            socket.userId!,
            result.data.content
          );

          if (!editedMessage?.room) {
            throw new Error("Message room not found");
          }

          broadcastToRoom(
            editedMessage.room.toString(), {
            type: "messageEdited",
            message: editedMessage,
          });
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to edit message",
            })
          );
        }

        break;
      }
      case "leaveRoom": {
        await roomService.leaveRoom(
          payload.room,
          socket.userId!
        );

        leaveRoom(socket, payload.room);

        socket.send(
          JSON.stringify({
            type: "roomLeft",
            room: payload.room,
          })
        );

        console.log(
          `${socket.username} a quitté ${payload.room}`
        );

        break;
      }

      case "deleteMessage": {
        try {
          const deletedMessage = await messageService.deleteMessage(
            payload.messageId,
            socket.userId!
          );

          if (!deletedMessage?.room) {
            throw new Error("Message not found or already deleted");
          }

          broadcastToRoom(
            deletedMessage.room.toString(),
            {
              type: "messageDeleted",
              message: deletedMessage,
            }
          );
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to delete message",
            })
          );
        }

        break;
      }
      case "typing": {
        broadcastToRoom(payload.roomId, {
          type: "typing",
          roomId: payload.roomId,
          user: {
            _id: socket.userId,
            username: socket.username,
          },
        });

        break;
      }

      case "stopTyping": {
        broadcastToRoom(payload.roomId, {
          type: "stopTyping",
          roomId: payload.roomId,
          user: {
            _id: socket.userId,
            username: socket.username,
          },
        });

        break;
      }

      case "seenMessage": {
        try {
          const message = await messageService.seenMessage(
            payload.messageId,
            socket.userId!
          );

          if (!message?.room) {
            throw new Error("Message not found");
          }

          broadcastToRoom(
            message.room.toString(),
            {
              type: "messageSeen",
              message,
            }
          );
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to mark message as seen",
            })
          );
        }

        break;
      }
      //ADDCASEreactTomessage
      case "reactMessage": {
        try {
          console.log("===== REACTION =====");
          console.log("Payload :", payload);
          console.log("User :", socket.userId);

          const message = await messageService.reactToMessage(
            payload.messageId,
            socket.userId!,
            payload.emoji
          );

          console.log("Résultat service :", message);

          if (!message) {
            throw new Error("reactToMessage returned null");
          }

          console.log("Room :", message.room);

          broadcastToRoom(message.room.toString(), {
            type: "messageReaction",
            message,
          });

          console.log("Broadcast envoyé");
        } catch (error) {
          console.error("REACT ERROR :", error);

          socket.send(
            JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to react to message",
            })
          );
        }

        break;
      }
case "getConversations": {
  await handleGetConversations(socket);

  break;
}
      // ============================================================
      // ===================  CHAT PRIVÉ (DM)  =========================
      // ============================================================

      case "privateMessage": {
        try {
          const message = await privateMessageService.send({
            sender: socket.userId!,
            receiver: payload.receiverId,
            content: payload.content,
            type: payload.typeMessage,
            replyTo: payload.replyTo,
            fileUrl: payload.fileUrl,
            fileName: payload.fileName,
            fileSize: payload.fileSize,
            mimeType: payload.mimeType,
          });

          const receiver = getSocketByUserId(payload.receiverId);

          console.log("Sender :", socket.userId);
          console.log("Receiver ID :", payload.receiverId);
          console.log("Receiver Socket :", receiver);

          if (receiver) {
            console.log("✅ Receiver trouvé");

            receiver.send(
              JSON.stringify({
                type: "privateMessage",
                message,
              })
            );
          } else {
            console.log("❌ Receiver introuvable");
          }

          socket.send(
            JSON.stringify({
              type: "privateMessage",
              message,
            })
          );

          console.log(
            `${socket.username} ➜ ${payload.receiverId}`
          );
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to send private message",
            })
          );
        }

        break;
      }

      // Historique paginé d'une conversation privée.
      // payload: { type: "privateHistory", withUserId, limit?, before? }
      case "privateHistory": {
        try {
          const messages = await privateMessageService.getConversation(
            socket.userId!,
            payload.withUserId,
            {
              limit: payload.limit,
              before: payload.before,
            }
          );

          socket.send(
            JSON.stringify({
              type: "privateHistory",
              withUserId: payload.withUserId,
              messages,
            })
          );
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to fetch private history",
            })
          );
        }

        break;
      }

      case "editPrivateMessage": {
        const result = editPrivateMessageSchema.safeParse(payload);

        if (!result.success) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Invalid edit private message payload",
            })
          );

          break;
        }

        try {
          const editedMessage = await privateMessageService.editMessageForUser(
            result.data.messageId,
            socket.userId!,
            result.data.content
          );

          if (!editedMessage) {
            throw new Error("Message not found");
          }

          const payloadOut = {
            type: "privateMessageEdited",
            message: editedMessage,
          };

          sendToUser(idOf(editedMessage.sender), payloadOut);
          sendToUser(idOf(editedMessage.receiver), payloadOut);
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to edit private message",
            })
          );
        }

        break;
      }

      case "deletePrivateMessage": {
        try {
          const deletedMessage = await privateMessageService.deleteMessage(
            payload.messageId,
            socket.userId!
          );

          if (!deletedMessage) {
            throw new Error("Message not found or already deleted");
          }

          const payloadOut = {
            type: "privateMessageDeleted",
            message: deletedMessage,
          };

          sendToUser(idOf(deletedMessage.sender), payloadOut);
          sendToUser(idOf(deletedMessage.receiver), payloadOut);
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to delete private message",
            })
          );
        }

        break;
      }

      case "seenPrivateMessage": {
        try {
          const message = await privateMessageService.seenMessage(
            payload.messageId,
            socket.userId!
          );

          if (!message) {
            throw new Error("Message not found");
          }

          const payloadOut = {
            type: "privateMessageSeen",
            message,
          };

          sendToUser(idOf(message.sender), payloadOut);
          sendToUser(idOf(message.receiver), payloadOut);
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to mark private message as seen",
            })
          );
        }

        break;
      }

      case "reactPrivateMessage": {
        const result = reactPrivateMessageSchema.safeParse(payload);

        if (!result.success) {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Invalid react private message payload",
            })
          );

          break;
        }

        try {
          const message = await privateMessageService.reactToMessage(
            result.data.messageId,
            socket.userId!,
            result.data.emoji
          );

          if (!message) {
            throw new Error("reactToMessage returned null");
          }

          const payloadOut = {
            type: "privateMessageReaction",
            message,
          };

          sendToUser(idOf(message.sender), payloadOut);
          sendToUser(idOf(message.receiver), payloadOut);
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Unable to react to private message",
            })
          );
        }

        break;
      }

      // payload: { type: "typingPrivate", receiverId }
      case "typingPrivate": {
        sendToUser(payload.receiverId, {
          type: "typingPrivate",
          from: {
            _id: socket.userId,
            username: socket.username,
          },
        });

        break;
      }

      case "stopTypingPrivate": {
        sendToUser(payload.receiverId, {
          type: "stopTypingPrivate",
          from: {
            _id: socket.userId,
            username: socket.username,
          },
        });

        break;
      }

      default:
        console.log("❓ Type inconnu :", payload.type);
    }
  } catch (error) {
    console.error("❌ WebSocket Error:", error);
  }
  //

};