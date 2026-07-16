import { Room, IRoom, RoomRole } from "../models/room.model.js";

export class RoomRepository {
  async create(data: {
    name: string;
    description?: string;
    owner: string;
  }): Promise<IRoom> {
    return await Room.create({
      name: data.name,
      description: data.description,
      owner: data.owner,
      members: [data.owner],
      roles: [
        {
          user: data.owner,
          role: RoomRole.OWNER,
        },
      ],
    });
  }

  async findAll(): Promise<IRoom[]> {
    return await Room.find()
      .populate("owner", "username")
      .sort({ createdAt: -1 });
  }

  async findByName(name: string): Promise<IRoom | null> {
    return await Room.findOne({ name });
  }

  async findById(id: string): Promise<IRoom | null> {
    return await Room.findById(id);
  }
 async updateSettings(
  roomId: string,
  data: { name?: string; description?: string; isPrivate?: boolean }
): Promise<IRoom | null> {
  return await Room.findByIdAndUpdate(
    roomId,
    {
      $set: data,
    },
    {
      new: true,
    }
  );
}
 async addMember(roomId: string, userId: string): Promise<IRoom | null> {

  console.log("ROOM ID reçu :", roomId);

  const room = await Room.findById(roomId);

  console.log("ROOM TROUVEE :", room);

  return await Room.findByIdAndUpdate(
    roomId,
    {
      $addToSet: {
        members: userId,
        roles: {
          user: userId,
          role: RoomRole.MEMBER,
        },
      },
    },
    {
      new: true,
    }
  );
}
async removeMember(roomId: string, userId: string): Promise<IRoom | null> {
  return await Room.findByIdAndUpdate(
    roomId,
    {
      $pull: {
        members: userId,
        roles: {
          user: userId,
        },
      },
    },
    {
      new: true,
    }
  );
}
async setRole(
  roomId: string,
  userId: string,
  role: RoomRole
): Promise<IRoom | null> {
  const room = await Room.findOneAndUpdate(
    {
      _id: roomId,
      "roles.user": userId,
    },
    {
      $set: {
        "roles.$.role": role,
      },
    },
    {
      new: true,
    }
  );

  if (room) {
    return room;
  }

  return await Room.findByIdAndUpdate(
    roomId,
    {
      $addToSet: {
        members: userId,
      },
      $push: {
        roles: {
          user: userId,
          role,
        },
      },
    },
    {
      new: true,
    }
  );
}
async transferOwnership(
  roomId: string,
  currentOwnerId: string,
  newOwnerId: string
): Promise<IRoom | null> {
  await this.setRole(roomId, currentOwnerId, RoomRole.ADMIN);
  await this.setRole(roomId, newOwnerId, RoomRole.OWNER);

  return await Room.findByIdAndUpdate(
    roomId,
    {
      owner: newOwnerId,
      $addToSet: {
        members: newOwnerId,
      },
    },
    {
      new: true,
    }
  );
}
async deleteRoom(roomId: string): Promise<IRoom | null> {
  return await Room.findByIdAndDelete(roomId);
}
async getUserRooms(userId: string) {
  return Room.find({
    members: userId,
  }).populate("owner", "username avatar");
}
/////get memebers
async getMembers(roomId: string) {
  return Room.findById(roomId)
    .populate("members", "username avatar");
}
}
