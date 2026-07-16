import { NotificationRepository } from "../repositories/notification.repository.js";
import { NotificationType } from "../models/notification.model.js";

const repository = new NotificationRepository();

export class NotificationService {

  async createPrivateNotification(
    sender: string,
    receiver: string,
    body: string
  ) {

    return repository.create({

      sender,

      receiver,

      type: NotificationType.PRIVATE_MESSAGE,

      title: "Nouveau message",

      body

    });

  }

}