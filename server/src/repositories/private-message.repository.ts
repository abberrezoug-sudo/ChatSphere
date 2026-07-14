import {
  PrivateMessage,
  PrivateMessageType,
} from "../models/private-message.model.js";
import { Types } from "mongoose";

export class PrivateMessageRepository {
  async create(data: {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    content: string;
    type?: PrivateMessageType;
  }) {
    return await PrivateMessage.create({
      sender: data.sender,
      receiver: data.receiver,
      content: data.content,
      type: data.type ?? PrivateMessageType.TEXT,
    });
  }
}