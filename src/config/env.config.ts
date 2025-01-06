import dotenv from "dotenv";
import logger from "../utils/logger.util";
dotenv.config();

const { PORT, DB_URL, SECRET_KEY, SLACK_WEBHOOK } = process.env;

//Validar variables críticas
if (!DB_URL || !SECRET_KEY || !SLACK_WEBHOOK) {
  const error = new Error(
    "Faltan variables de entorno críticas. Verifica tu archivo .env."
  );
  logger.error(error.message);
  throw error;
}

export const env = {
  port: PORT || 4000,
  db_url: DB_URL,
  secret_key: SECRET_KEY,
  slack_webhook: SLACK_WEBHOOK,
};
