import NotificationRepository from "../repositories/NotificationRepository";
import { INotification, NotificationType } from "../models/Notification";
import { Types } from "mongoose";
import { sendNotification } from "../config/websocket";

class NotificationService {
  /**
   * Crea una notificación para un usuario
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    content: string
  ): Promise<INotification> {
    const userObjectId = new Types.ObjectId(userId);

    const notification = await NotificationRepository.createNotification({
      userId: userObjectId,
      type,
      content,
    });

    sendNotification(userId, { type, content });

    return notification;
  }

  /**
   * Obtiene todas las notificaciones de un usuario
   */
  async getUserNotifications(userId: string): Promise<INotification[]> {
    return await NotificationRepository.getNotificationsByUser(userId);
  }

  /**
   * Marca una notificación como leída
   */
  async markAsRead(notificationId: string): Promise<INotification | null> {
    return await NotificationRepository.markAsRead(notificationId);
  }

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  async markAllAsRead(userId: string): Promise<void> {
    await NotificationRepository.markAllAsRead(userId);
  }

  /**
   * Elimina una notificación
   */
  async deleteNotification(
    notificationId: string
  ): Promise<INotification | null> {
    return await NotificationRepository.deleteNotification(notificationId);
  }
}

export default new NotificationService();
