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
async getNotifications(userId: string) {
    return repository.getUserNotifications(userId);
  }

  async readNotification(notificationId: string) {
    return repository.markAsRead(notificationId);
  }

  async unreadCount(userId: string) {
    return repository.countUnread(userId);
  }
////////////////ROOM notif/////////
async createRoomNotification( 
    sender: string,
    receiver: string,
    roomName: string,
    body: string
){

    return repository.create({

      sender,

      receiver,

      type: NotificationType.ROOM_MESSAGE,

      title: roomName,

      body

    });
}
}
