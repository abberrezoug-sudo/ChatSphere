import { Types } from "mongoose";
import {
  PrivateMessageType,
} from "../models/private-message.model.js";
import { PrivateMessageRepository } from "../repositories/private-message.repository.js";

const repository = new PrivateMessageRepository();

export class PrivateMessageService {
  async send(
    sender: string,
    receiver: string,
    content: string,
    type: PrivateMessageType = PrivateMessageType.TEXT
  ) {
    if (!Types.ObjectId.isValid(sender))
      throw new Error("Invalid sender");

    if (!Types.ObjectId.isValid(receiver))
      throw new Error("Invalid receiver");

    return await repository.create({
      sender: new Types.ObjectId(sender),
      receiver: new Types.ObjectId(receiver),
      content,
      type,
    });
  }
}