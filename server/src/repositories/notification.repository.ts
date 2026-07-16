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
      .sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string) {
    return Notification.findByIdAndUpdate(
      notificationId,
      {
        read: true,
      },
      {
        new: true,
      }
    )
      .populate("sender", "username avatar");
  }

  async countUnread(userId: string) {
    return Notification.countDocuments({ ///count doucumment 
      receiver: userId,
      read: false,
    });
  }
}