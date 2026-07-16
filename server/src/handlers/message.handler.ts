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
import { NotificationService } from "../services/notification.service.js";
import { RoomRepository } from "../repositories/room.repository.js";
import { PinnedMessageService } from "../services/pinned-message.service.js";
import {
  pinMessageSchema,
  unpinMessageSchema,
  getPinnedMessagesSchema,
} from "../validators/pinned-message.validator.js";
import { handleSearch } from "./search.handler.js";
import { UserBlockService } from "../services/user-block.service.js";
import { ArchivedConversationService } from "../services/archived-conversation.service.js";
import { RoomInvitationService } from "../services/room-invitation.service.js";
import { ArchivedConversationType } from "../models/archived-conversation.model.js";
import { RoomRole } from "../models/room.model.js";
const pinnedMessageService = new PinnedMessageService();
const messageService = new MessageService();
const roomService = new RoomService();
const privateMessageService = new PrivateMessageService();
const notificationService = new NotificationService();
const roomRepository = new RoomRepository();
const userBlockService = new UserBlockService();
const archivedConversationService = new ArchivedConversationService();
const roomInvitationService = new RoomInvitationService();
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
  try {
    console.log(`${socket.username} : ${payload.content}`);

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

    const room = await roomRepository.getMembers(payload.room);

    if (room) {
      for (const member of room.members as any[]) {
        if (member._id.toString() === socket.userId) {
          continue;
        }

        const notification = await notificationService.createRoomNotification(
          socket.userId!,
          member._id.toString(),
          room.name,
          savedMessage.content
        );

        const memberSocket = getSocketByUserId(member._id.toString());

        if (memberSocket) {
          memberSocket.send(
            JSON.stringify({ type: "notification", notification })
          );
        }
      }
    }

    broadcastToRoom(payload.room, {
      type: "message",
      message: savedMessage,
    });
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to send message",
      })
    );
  }

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
  await handleGetConversations(socket, payload);

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

    const notification =
      await notificationService.createPrivateNotification(
        socket.userId!,
        payload.receiverId,
        message.content
      );

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

      receiver.send(
        JSON.stringify({
          type: "notification",
          notification,
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

    console.log(`${socket.username} ➜ ${payload.receiverId}`);
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

  console.log("Payload :", payload);
  console.log("receiverId :", payload.receiverId);

  const history = await privateMessageService.getConversation(
    socket.userId!,
    payload.receiverId,
    payload.limit ?? 20,
    payload.before
  );

  socket.send(
    JSON.stringify({
      type: "privateHistory",
      messages: history.messages,
      hasMore: history.hasMore,
    })
  );

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
    const { message, notification } =
      await privateMessageService.reactToMessage(
        result.data.messageId,
        socket.userId!,
        result.data.emoji
      );

    if (!message) {
      throw new Error("reactToMessage returned null");
    }

    if (notification) {
      sendToUser(idOf(message.sender), {
        type: "notification",
        notification,
      });
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
//add get notif cas 
case "getNotifications": {

    const notifications =
        await notificationService.getNotifications(
            socket.userId!
        );

    socket.send(
        JSON.stringify({
            type: "notifications",
            notifications,
        })
    );

    break;
}
//////////////////////////ADD Read notif case/////////////////////
///////////////////////////////////////////////////
case "readNotification": {

    const notification =
        await notificationService.readNotification(
            payload.notificationId
        );

    socket.send(
        JSON.stringify({
            type: "notificationRead",
            notification,
        })
    );

    break;
}
///////////////////////unreadNotificationCount CASE///////////////////////
//////////////////////////////////////////////////////////////////////////
case "unreadNotificationCount": {

    const count =
        await notificationService.unreadCount(
            socket.userId!
        );

    socket.send(
        JSON.stringify({
            type: "unreadNotificationCount",
            count,
        })
    );

    break;
}
case "notificationHistory": {

  const history =
    await notificationService.getNotifications(

      socket.userId!,

      payload.limit ?? 20,

      payload.before

    );

  socket.send(
    JSON.stringify({

      type: "notificationHistory",

      notifications:
        history.notifications,

      hasMore:
        history.hasMore

    })
  );

  break;
}
///////////////////////////////////////////SEARCH////////////////////////
///////////////////////////////////////////CASE/////////////////////////
case "search": {
  await handleSearch(socket, payload);
  break;
}
////////pign case/////////////////////////////
//////////////////////////////////////
case "pinMessage": {
  const result = pinMessageSchema.safeParse(payload);

  if (!result.success) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Invalid pin message payload",
      })
    );

    break;
  }

  try {
    const pin = await pinnedMessageService.pinMessage(
      result.data.messageId,
      result.data.roomId,
      socket.userId!
    );

    broadcastToRoom(result.data.roomId, {
      type: "messagePinned",
      pin,
    });
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to pin message",
      })
    );
  }

  break;
}

case "unpinMessage": {
  const result = unpinMessageSchema.safeParse(payload);

  if (!result.success) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Invalid unpin message payload",
      })
    );

    break;
  }

  try {
    const pin = await pinnedMessageService.unpinMessage(
      result.data.messageId,
      result.data.roomId,
      socket.userId!
    );

    broadcastToRoom(result.data.roomId, {
      type: "messageUnpinned",
      pin,
    });
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to unpin message",
      })
    );
  }

  break;
}

case "getPinnedMessages": {
  const result = getPinnedMessagesSchema.safeParse(payload);

  if (!result.success) {
    socket.send(
      JSON.stringify({
        type: "error",
        message: "Invalid get pinned messages payload",
      })
    );

    break;
  }

  try {
    const pinnedMessages = await pinnedMessageService.getPinnedMessages(
      result.data.roomId,
      result.data.limit ?? 20,
      result.data.before
    );

    socket.send(
      JSON.stringify({
        type: "pinnedMessages",
        roomId: result.data.roomId,
        pinnedMessages: pinnedMessages.pinnedMessages,
        hasMore: pinnedMessages.hasMore,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch pinned messages",
      })
    );
  }

  break;
}

case "setRoomRole": {
  try {
    const room = await roomService.setRole(
      payload.roomId,
      socket.userId!,
      payload.userId,
      payload.role as RoomRole
    );

    broadcastToRoom(payload.roomId, {
      type: "roomRoleUpdated",
      room,
    });
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to update role",
      })
    );
  }

  break;
}

case "transferRoomOwnership": {
  try {
    const room = await roomService.transferOwnership(
      payload.roomId,
      socket.userId!,
      payload.userId
    );

    broadcastToRoom(payload.roomId, {
      type: "roomOwnershipTransferred",
      room,
    });
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to transfer ownership",
      })
    );
  }

  break;
}

case "removeRoomUser": {
  try {
    const room = await roomService.removeUser(
      payload.roomId,
      socket.userId!,
      payload.userId
    );

    broadcastToRoom(payload.roomId, {
      type: "roomUserRemoved",
      room,
      userId: payload.userId,
    });
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to remove user",
      })
    );
  }

  break;
}

case "updateRoomSettings": {
  try {
    const room = await roomService.updateSettings(
      payload.roomId,
      socket.userId!,
      {
        name: payload.name,
        description: payload.description,
        isPrivate: payload.isPrivate,
      }
    );

    broadcastToRoom(payload.roomId, {
      type: "roomSettingsUpdated",
      room,
    });
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update room settings",
      })
    );
  }

  break;
}

case "deleteRoom": {
  try {
    const room = await roomService.deleteRoom(
      payload.roomId,
      socket.userId!
    );

    broadcastToRoom(payload.roomId, {
      type: "roomDeleted",
      room,
    });
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to delete room",
      })
    );
  }

  break;
}

case "inviteRoomUser": {
  try {
    const invitation = await roomInvitationService.inviteUser({
      roomId: payload.roomId,
      invitedBy: socket.userId!,
      invitedUser: payload.userId,
      expiresAt: payload.expiresAt,
      maxUses: payload.maxUses,
    });

    socket.send(
      JSON.stringify({
        type: "roomInvitationCreated",
        invitation,
      })
    );

    sendToUser(payload.userId, {
      type: "roomInvitationReceived",
      invitation,
    });
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create invitation",
      })
    );
  }

  break;
}

case "createRoomInviteLink": {
  try {
    const invitation = await roomInvitationService.createInviteLink({
      roomId: payload.roomId,
      invitedBy: socket.userId!,
      expiresAt: payload.expiresAt,
      maxUses: payload.maxUses,
    });

    socket.send(
      JSON.stringify({
        type: "roomInviteLinkCreated",
        invitation,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create invite link",
      })
    );
  }

  break;
}

case "acceptRoomInvitation": {
  try {
    const invitation = await roomInvitationService.acceptInvitation(
      payload.token,
      socket.userId!
    );

    if (invitation?.room) {
      joinRoom(invitation.room.toString(), socket);
    }

    socket.send(
      JSON.stringify({
        type: "roomInvitationAccepted",
        invitation,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to accept invitation",
      })
    );
  }

  break;
}

case "rejectRoomInvitation": {
  try {
    const invitation = await roomInvitationService.rejectInvitation(
      payload.token,
      socket.userId!
    );

    socket.send(
      JSON.stringify({
        type: "roomInvitationRejected",
        invitation,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to reject invitation",
      })
    );
  }

  break;
}

case "revokeRoomInvitation": {
  try {
    const invitation = await roomInvitationService.revokeInvitation(
      payload.invitationId,
      socket.userId!
    );

    socket.send(
      JSON.stringify({
        type: "roomInvitationRevoked",
        invitation,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to revoke invitation",
      })
    );
  }

  break;
}

case "blockUser": {
  try {
    const block = await userBlockService.blockUser(
      socket.userId!,
      payload.userId
    );

    socket.send(
      JSON.stringify({
        type: "userBlocked",
        block,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to block user",
      })
    );
  }

  break;
}

case "unblockUser": {
  try {
    const block = await userBlockService.unblockUser(
      socket.userId!,
      payload.userId
    );

    socket.send(
      JSON.stringify({
        type: "userUnblocked",
        block,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to unblock user",
      })
    );
  }

  break;
}

case "getBlockedUsers": {
  try {
    const result = await userBlockService.getBlockedUsers(
      socket.userId!,
      payload.limit ?? 20,
      payload.before
    );

    socket.send(
      JSON.stringify({
        type: "blockedUsers",
        ...result,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch blocked users",
      })
    );
  }

  break;
}

case "archiveConversation": {
  try {
    const archive = await archivedConversationService.archiveConversation({
      userId: socket.userId!,
      type: payload.conversationType as ArchivedConversationType,
      otherUserId: payload.otherUserId,
      roomId: payload.roomId,
    });

    socket.send(
      JSON.stringify({
        type: "conversationArchived",
        archive,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to archive conversation",
      })
    );
  }

  break;
}

case "restoreConversation": {
  try {
    const archive = await archivedConversationService.restoreConversation({
      userId: socket.userId!,
      type: payload.conversationType as ArchivedConversationType,
      otherUserId: payload.otherUserId,
      roomId: payload.roomId,
    });

    socket.send(
      JSON.stringify({
        type: "conversationRestored",
        archive,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to restore conversation",
      })
    );
  }

  break;
}

case "archivedConversations": {
  await handleGetConversations(socket, {
    ...payload,
    archived: true,
  }, "archivedConversations");

  break;
}
////////////////////mesage history////////////
//////////////////////////////////////////////
case "roomHistory": {
  try {
    const history = await messageService.getRoomMessages(
      payload.roomId,
      payload.limit ?? 20,
      payload.before
    );

    socket.send(
      JSON.stringify({
        type: "roomHistory",
        messages: history.messages,
        hasMore: history.hasMore,
      })
    );
  } catch (error) {
    socket.send(
      JSON.stringify({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load room history",
      })
    );
  }

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
