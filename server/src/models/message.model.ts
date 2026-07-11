import { Schema, model, Types, Document } from "mongoose";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  PRIVATE = "private",
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  receiver?: Types.ObjectId;
  room?: string;
  content: string;
  type: MessageType;
  edited: boolean;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    room: {
      type: String,
      trim: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
    },

    edited: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = model<IMessage>("Message", messageSchema);
