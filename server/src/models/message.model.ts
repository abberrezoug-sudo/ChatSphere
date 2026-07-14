import { Schema, model, Types } from "mongoose";

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
}

export interface ISeenBy {
  user: Types.ObjectId;
  seenAt: Date;
}

export interface IReaction {
  user: Types.ObjectId;
  emoji: string;
}

export interface IMessage {
  sender: Types.ObjectId;
  room: Types.ObjectId;
  content: string;
  type: MessageType;
  edited: boolean;
  deleted: boolean;
  seenBy: ISeenBy[];
  replyTo?: Types.ObjectId | null;
  reactions: IReaction[];
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

    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
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

    seenBy: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        seenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    reactions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        emoji: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Message = model<IMessage>("Message", messageSchema);