import colors from "colors";
import { createServer } from "http";
import app from "./server"; // Tu configuración de Express
import logger from "./utils/logger.util";
import { env } from "./config/env.config";
import { setupWebSocket } from "./config/websocket";

const port = env.port;
const server = createServer(app); // 🔹 Crea un servidor HTTP usando Express
setupWebSocket(server); // 🔹 Inicia WebSockets en el mismo servidor

// Iniciar el servidor
server.listen(port, () => {
  logger.info(
    colors.cyan.bold(`✅ API funcionando en http://localhost:${port}`)
  );
  logger.info(colors.yellow(`🔹 Entorno: ${env.node_env}`));
  logger.info(colors.green("📄 Swagger disponible en /api/docs"));
  logger.info(colors.blue("📡 WebSockets listos en el mismo servidor 🚀"));
});
