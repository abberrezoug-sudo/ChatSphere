import { Schema, model, Types } from "mongoose";

export enum RoomRole {
  OWNER = "owner",
  ADMIN = "admin",
  MODERATOR = "moderator",
  MEMBER = "member",
}

export interface IRoomRole {
  user: Types.ObjectId;
  role: RoomRole;
}

export interface IRoom {
  name: string;
  description?: string;
  isPrivate: boolean;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  roles: IRoomRole[];
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    roles: {
      type: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          role: {
            type: String,
            enum: Object.values(RoomRole),
            default: RoomRole.MEMBER,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ members: 1 });
roomSchema.index({ "roles.user": 1 });

export const Room = model<IRoom>("Room", roomSchema);
