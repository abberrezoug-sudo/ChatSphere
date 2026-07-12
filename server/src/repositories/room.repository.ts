import { Room, IRoom } from "../models/room.model.js";

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
  async addMember(roomId: string, userId: string): Promise<IRoom | null> {
  return await Room.findByIdAndUpdate(
    roomId,
    {
      $addToSet: {
        members: userId,
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
      },
    },
    {
      new: true,
    }
  );
}
}