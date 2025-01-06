import colors from "colors";
import server from "./server";
import logger from "./utils/logger.util";
import { env } from "./config/env.config";

const port = env.port;

server.listen(port, () =>
  logger.info(
    colors.cyan.bold(
      `REST API Funcionando en el puerto: http://localhost:${port}`
    )
  )
);
