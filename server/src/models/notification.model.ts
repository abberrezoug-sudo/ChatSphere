import { Schema, model, Types } from "mongoose";

export enum NotificationType {
  PRIVATE_MESSAGE = "private_message",
  ROOM_MESSAGE = "room_message",
}

export interface INotification {
  receiver: Types.ObjectId;

  sender: Types.ObjectId;

  type: NotificationType;

  title: string;

  body: string;

  read: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = model(
  "Notification",
  notificationSchema
);