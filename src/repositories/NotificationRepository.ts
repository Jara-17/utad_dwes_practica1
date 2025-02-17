import Notification, { INotification } from "../models/Notification";
import { Types } from "mongoose";

class NotificationRepository {
  async createNotification(
    data: Partial<INotification>
  ): Promise<INotification> {
    return await Notification.create(data);
  }

  async getNotificationsByUser(userId: string): Promise<INotification[]> {
    return await Notification.find({ userId: new Types.ObjectId(userId) }).sort(
      { createdAt: -1 }
    );
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId: new Types.ObjectId(userId) },
      { isRead: true }
    );
  }

  async deleteNotification(
    notificationId: string
  ): Promise<INotification | null> {
    return await Notification.findByIdAndDelete(notificationId);
  }
}

export default new NotificationRepository();
