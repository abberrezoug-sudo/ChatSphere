import { Schema, model, Types } from "mongoose";

export enum PrivateMessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
}

        export interface IPrivateMessage {
     sender: Types.ObjectId;
     receiver: Types.ObjectId;

         content: string;

              type: PrivateMessageType;

        edited: boolean;
        deleted: boolean;

               seen: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const privateMessageSchema = new Schema<IPrivateMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: Object.values(PrivateMessageType),
      default: PrivateMessageType.TEXT,
    },

    edited: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
    },

    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const PrivateMessage = model<IPrivateMessage>(
  "PrivateMessage",
  privateMessageSchema
);