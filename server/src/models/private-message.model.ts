import { Schema, model, Types } from "mongoose";

export enum PrivateMessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
}

export interface IPrivateMessageReaction {
  user: Types.ObjectId;
  emoji: string;
}

export interface IPrivateMessageSeen {
  user: Types.ObjectId;
  seenAt: Date;
}

export interface IPrivateMessage {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;

  content: string;

  type: PrivateMessageType;

  replyTo: Types.ObjectId | null;

  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;

  reactions: IPrivateMessageReaction[];
  seenBy: IPrivateMessageSeen[];

  edited: boolean;
  deleted: boolean;

  // Conservé pour compatibilité avec le code existant qui lit `seen`.
  // La donnée "source de vérité" pour les accusés de lecture est `seenBy`.
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

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "PrivateMessage",
      default: null,
    },

    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
    },

    reactions: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: "User", required: true },
          emoji: { type: String, required: true },
        },
      ],
      default: [],
    },

    seenBy: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: "User", required: true },
          seenAt: { type: Date, required: true },
        },
      ],
      default: [],
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

// Index composé pour accélérer la récupération paginée d'une conversation
privateMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
privateMessageSchema.index({ receiver: 1, sender: 1, createdAt: -1 });

export const PrivateMessage = model<IPrivateMessage>(
  "PrivateMessage",
  privateMessageSchema
);