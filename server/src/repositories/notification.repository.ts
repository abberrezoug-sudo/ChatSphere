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
  async findByUser(
  userId: string,
  limit = 20,
  before?: string
) {
  const query: any = {
    receiver: userId,
  };

  if (before) {
    query.createdAt = {
      $lt: new Date(before),
    };
  }

  const notifications = await Notification.find(query)
    .populate("sender", "username avatar")
    .sort({
      createdAt: -1,
    })
    .limit(limit + 1);

  const hasMore =
    notifications.length > limit;

  return {
    notifications: hasMore
      ? notifications.slice(0, limit)
      : notifications,

    hasMore,
  };
}
}