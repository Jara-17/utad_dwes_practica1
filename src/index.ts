import colors from "colors";
import { Server } from "http";
import server from "./server";
import logger from "./utils/logger.util";
import { env } from "./config/env.config";

const port = env.port;
let serverInstance: Server;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    serverInstance = server.listen(port, () => {
      logger.info(
        colors.cyan.bold(
          `REST API Funcionando en el puerto: http://localhost:${port}`
        )
      );
      logger.info(colors.yellow(`Entorno: ${env.node_env}`));
      logger.info(colors.green("Swagger docs disponibles en /api/docs"));
    });
  } catch (error) {
    logger.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Función para cerrar el servidor de forma controlada
const shutdownServer = async () => {
  if (serverInstance) {
    try {
      await new Promise<void>((resolve, reject) => {
        logger.info(colors.yellow("Cerrando el servidor..."));
        serverInstance.close((err) => {
          if (err) {
            logger.error("Error al cerrar el servidor:", err);
            reject(err);
          } else {
            logger.info(colors.green("Servidor cerrado correctamente"));
            resolve();
          }
        });
      });
    } catch (error) {
      logger.error("Error durante el cierre del servidor:", error);
      process.exit(1);
    }
  }
  process.exit(0);
};

// Manejo de señales de terminación
process.on("SIGTERM", shutdownServer);
process.on("SIGINT", shutdownServer);

// Manejo de excepciones no capturadas
process.on("uncaughtException", (error) => {
  logger.error("Excepción no capturada:", error);
  shutdownServer();
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Promesa rechazada no manejada: ${reason}`);
  shutdownServer();
});

// Iniciar el servidor
startServer();
