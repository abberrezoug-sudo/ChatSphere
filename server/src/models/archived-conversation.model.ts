import { Schema, model, Types } from "mongoose";

export enum ArchivedConversationType {
  PRIVATE = "private",
  ROOM = "room",
}

export interface IArchivedConversation {
  user: Types.ObjectId;
  type: ArchivedConversationType;
  otherUser?: Types.ObjectId | null;
  room?: Types.ObjectId | null;
  archived: boolean;
  archivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const archivedConversationSchema = new Schema<IArchivedConversation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ArchivedConversationType),
      required: true,
    },
    otherUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    archived: {
      type: Boolean,
      default: true,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

archivedConversationSchema.index({
  user: 1,
  type: 1,
  otherUser: 1,
});
archivedConversationSchema.index({
  user: 1,
  type: 1,
  room: 1,
});

export const ArchivedConversation = model<IArchivedConversation>(
  "ArchivedConversation",
  archivedConversationSchema
);
