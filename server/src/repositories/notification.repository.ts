import { Notification } from "../models/notification.model.js";

export class NotificationRepository {

  async create(data: any) {
    return Notification.create(data);
  }

  async getUserNotifications(userId: string) {
    return Notification.find({
      receiver: userId,
    })
      .populate("sender", "username avatar")
      .sort({
        createdAt: -1,
      });
  }

  async markAsRead(id: string) {
    return Notification.findByIdAndUpdate(
      id,
      {
        read: true,
      },
      {
        new: true,
      }
    );
  }

}