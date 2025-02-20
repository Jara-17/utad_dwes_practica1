import colors from "colors";
import { createServer } from "https"; // 🔹 Usar `https` en lugar de `http`
import app from "./server"; // Express API
import logger from "./utils/logger.util";
import { env } from "./config/env.config";
import { setupWebSocket } from "./config/websocket";
import fs from "fs";
import path from "path";

const port = env.port;

// 🔹 Cargar certificados SSL
const options = {
  key: fs.readFileSync(path.join(__dirname, "cert/localhost-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert/localhost.pem")),
};

// 🔹 Crear servidor HTTPS
const server = createServer(options, app);
setupWebSocket(server); // 🔹 Iniciar WebSockets en el mismo servidor HTTPS

// 🔹 Iniciar el servidor
server.listen(port, () => {
  logger.info(
    colors.cyan.bold(`✅ API funcionando en https://localhost:${port}`)
  );
  logger.info(colors.yellow(`🔹 Entorno: ${env.node_env}`));
  logger.info(colors.green("📄 Swagger disponible en /api/docs"));
  logger.info(colors.blue("📡 WebSockets listos en el mismo servidor 🚀"));
});
