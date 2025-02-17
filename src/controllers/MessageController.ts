import { Request, Response } from "express";
import MessageService from "../services/MessageService";
import {
  sendHttpResponse,
  sendHttpError,
  HttpStatus,
} from "../utils/httpResponse.util";

export class MessageController {
  static async sendMessage(req: Request, res: Response) {
    try {
      const { senderId, receiverId, content } = req.body;
      const message = await MessageService.sendMessage(
        senderId,
        receiverId,
        content
      );

      sendHttpResponse({
        res,
        status: HttpStatus.CREATED,
        message: "Mensaje enviado con éxito",
        data: message,
      });
    } catch (error) {
      sendHttpError({
        res,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al enviar el mensaje",
      });
    }
  }

  static async getUserMessages(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const messages = await MessageService.getUserMessages(userId);

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        message: "Mensajes obtenidos correctamente",
        data: messages,
      });
    } catch (error) {
      sendHttpError({
        res,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al obtener los mensajes",
      });
    }
  }

  static async getConversation(req: Request, res: Response) {
    try {
      const { senderId, receiverId } = req.params;
      const messages = await MessageService.getConversation(
        senderId,
        receiverId
      );

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        message: "Conversación obtenida correctamente",
        data: messages,
      });
    } catch (error) {
      sendHttpError({
        res,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al obtener la conversación",
      });
    }
  }

  static async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId, userId } = req.body;
      const message = await MessageService.deleteMessage(messageId, userId);

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        message: "Mensaje eliminado correctamente",
        data: message,
      });
    } catch (error) {
      sendHttpError({
        res,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Error al eliminar el mensaje",
      });
    }
  }
}
