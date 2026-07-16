import { Schema, model, Types } from "mongoose";

export enum RoomInvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  REVOKED = "revoked",
  EXPIRED = "expired",
}

export interface IRoomInvitation {
  room: Types.ObjectId;
  invitedBy: Types.ObjectId;
  invitedUser?: Types.ObjectId | null;
  token: string;
  expiresAt: Date;
  maxUses: number;
  uses: number;
  status: RoomInvitationStatus;
  acceptedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const roomInvitationSchema = new Schema<IRoomInvitation>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    maxUses: {
      type: Number,
      default: 1,
      min: 1,
    },
    uses: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(RoomInvitationStatus),
      default: RoomInvitationStatus.PENDING,
      index: true,
    },
    acceptedBy: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

roomInvitationSchema.index({ room: 1, invitedUser: 1, status: 1 });

export const RoomInvitation = model<IRoomInvitation>(
  "RoomInvitation",
  roomInvitationSchema
);
