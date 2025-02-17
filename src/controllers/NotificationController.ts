import { Request, Response } from "express";
import NotificationService from "../services/NotificationService";
import {
  sendHttpResponse,
  sendHttpError,
  HttpStatus,
} from "../utils/httpResponse.util";

export class NotificationController {
  static async createNotification(req: Request, res: Response) {
    try {
      const { userId, type, content } = req.body;
      const notification = await NotificationService.createNotification(
        userId,
        type,
        content
      );

      sendHttpResponse({
        res,
        status: HttpStatus.CREATED,
        message: "Notificación creada con éxito",
        data: notification,
      });
    } catch (error) {
      sendHttpError({
        res,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al crear la notificación",
      });
    }
  }

  static async getUserNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const notifications = await NotificationService.getUserNotifications(
        userId
      );

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        message: "Notificaciones obtenidas correctamente",
        data: notifications,
      });
    } catch (error) {
      sendHttpError({
        res,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al obtener las notificaciones",
      });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const notification = await NotificationService.markAsRead(notificationId);

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        message: "Notificación marcada como leída",
        data: notification,
      });
    } catch (error) {
      sendHttpError({
        res,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al marcar la notificación como leída",
      });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      await NotificationService.markAllAsRead(userId);

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        message: "Todas las notificaciones han sido marcadas como leídas",
      });
    } catch (error) {
      sendHttpError({
        res,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al marcar todas las notificaciones como leídas",
      });
    }
  }

  static async deleteNotification(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const notification = await NotificationService.deleteNotification(
        notificationId
      );

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        message: "Notificación eliminada correctamente",
        data: notification,
      });
    } catch (error) {
      sendHttpError({
        res,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al eliminar la notificación",
      });
    }
  }
}
