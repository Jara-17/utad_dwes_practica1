import { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { env } from "./env.config";
import logger from "../utils/logger.util";

interface ConnectedClients {
  [userId: string]: WebSocket;
}

const clients: ConnectedClients = {};

// 🔹 Configurar WebSockets en el mismo servidor HTTP
export const setupWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const token = req.url?.split("token=")[1];

    if (!token) {
      ws.close();
      return;
    }

    try {
      const decoded = jwt.verify(token, env.secret_key) as { userId: string };
      const userId = decoded.userId;

      clients[userId] = ws;
      logger.info(`📡 Usuario conectado a WebSocket: ${userId}`);

      ws.on("message", (message) => {
        handleMessage(userId, message.toString());
      });

      ws.on("close", () => {
        logger.info(`❌ Usuario desconectado de WebSocket: ${userId}`);
        delete clients[userId];
      });
    } catch (error) {
      logger.error("❌ Error en autenticación WebSocket", {
        error: error.message,
      });
      ws.close();
    }
  });

  return wss;
};

// 🔹 Manejo de mensajes entrantes (opcional)
const handleMessage = (userId: string, message: string) => {
  logger.info(`📨 Mensaje recibido de ${userId}: ${message}`);
};

// 🔹 Enviar notificaciones en tiempo real
export const sendNotification = (userId: string, data: any) => {
  if (clients[userId]) {
    clients[userId].send(JSON.stringify(data));
  }
};
