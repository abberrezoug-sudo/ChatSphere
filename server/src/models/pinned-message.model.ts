import { Schema, model, Types, Document } from "mongoose";

export interface IPinnedMessage extends Document {
  message: Types.ObjectId;
  room: Types.ObjectId;
  pinnedBy: Types.ObjectId;
  active: boolean;
  unpinnedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const pinnedMessageSchema = new Schema<IPinnedMessage>(
  {
    message: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    pinnedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    unpinnedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Un même message ne peut avoir qu'un seul épinglage "actif" à la fois
pinnedMessageSchema.index(
  { message: 1, active: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

// Récupération rapide des épinglages actifs d'une room, triés par date
pinnedMessageSchema.index({ room: 1, active: 1, createdAt: -1 });

export const PinnedMessage = model<IPinnedMessage>(
  "PinnedMessage",
  pinnedMessageSchema
);