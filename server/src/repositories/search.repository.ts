import { User } from "../models/User.js";
import { Room } from "../models/room.model.js";
import { Message } from "../models/message.model.js";
import { PrivateMessage } from "../models/private-message.model.js";

export class SearchRepository {
  // ===========================
  // USERS
  // ===========================

  async searchUsers(query: string) {
    return await User.find({
      username: {
        $regex: query,
        $options: "i",
      },
    })
      .select("_id username avatar")
      .limit(20);
  }

  // ===========================
  // ROOMS
  // ===========================

  async searchRooms(userId: string, query: string) {
    return await Room.find({
      members: userId,
      name: {
        $regex: query,
        $options: "i",
      },
    })
      .select("_id name description")
      .limit(20);
  }

  // ===========================
  // PRIVATE MESSAGES
  // ===========================

  async searchPrivateMessages(
    userId: string,
    query: string
  ) {
    return await PrivateMessage.find({
      deleted: false,

      content: {
        $regex: query,
        $options: "i",
      },

      $or: [
        {
          sender: userId,
        },
        {
          receiver: userId,
        },
      ],
    })
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar")
      .sort({
        createdAt: -1,
      })
      .limit(20);
  }

  // ===========================
  // ROOM MESSAGES
  // ===========================

  async searchRoomMessages(
    userId: string,
    query: string
  ) {
    const rooms = await Room.find({
      members: userId,
    }).select("_id");

    const roomIds = rooms.map((room) => room._id);

    return await Message.find({
      deleted: false,

      room: {
        $in: roomIds,
      },

      content: {
        $regex: query,
        $options: "i",
      },
    })
      .populate("sender", "username avatar")
      .populate("room", "name")
      .sort({
        createdAt: -1,
      })
      .limit(20);
  }
}