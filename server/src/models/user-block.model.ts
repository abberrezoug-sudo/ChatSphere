import { Schema, model, Types } from "mongoose";

export interface IUserBlock {
  blocker: Types.ObjectId;
  blocked: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userBlockSchema = new Schema<IUserBlock>(
  {
    blocker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    blocked: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

userBlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export const UserBlock = model<IUserBlock>("UserBlock", userBlockSchema);
