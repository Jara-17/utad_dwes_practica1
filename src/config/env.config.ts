import dotenv from "dotenv";
import logger from "../utils/logger.util";

// Cargar variables de entorno
const result = dotenv.config();

if (result.error) {
  logger.error("Error al cargar el archivo .env", {
    error: result.error.message,
    stack: result.error.stack
  });
  throw result.error;
}

// Definir tipos para las variables de entorno
interface EnvConfig {
  port: number;
  db_url: string;
  secret_key: string;
  slack_webhook: string;
  node_env: "development" | "production" | "test";
  log_level: "debug" | "info" | "warn" | "error";
}

// Validar y obtener variables de entorno
const getEnvVar = (key: string, required: boolean = true): string => {
  const value = process.env[key];
  if (required && !value) {
    const error = new Error(`Variable de entorno requerida: ${key}`);
    logger.error("Error en configuración de entorno", {
      missingVar: key,
      error: error.message
    });
    throw error;
  }
  return value || "";
};

// Validar formato de URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validar y convertir puerto
const validatePort = (port: string): number => {
  const numPort = parseInt(port, 10);
  if (isNaN(numPort) || numPort <= 0 || numPort > 65535) {
    logger.warn("Puerto inválido, usando puerto por defecto 4000", {
      invalidPort: port
    });
    return 4000;
  }
  return numPort;
};

// Declare the variable first
let env: EnvConfig;

// Validar variables críticas
try {
  logger.info("Iniciando validación de variables de entorno");

  const DB_URL = getEnvVar("DB_URL");
  const SECRET_KEY = getEnvVar("SECRET_KEY");
  const SLACK_WEBHOOK = getEnvVar("SLACK_WEBHOOK");
  const NODE_ENV = getEnvVar("NODE_ENV", false) || "development";
  const LOG_LEVEL = getEnvVar("LOG_LEVEL", false) || "info";
  const PORT = getEnvVar("PORT", false);

  // Validaciones adicionales
  if (!isValidUrl(DB_URL)) {
    throw new Error("URL de base de datos inválida");
  }

  if (!isValidUrl(SLACK_WEBHOOK)) {
    throw new Error("URL de Slack Webhook inválida");
  }

  if (SECRET_KEY.length < 32) {
    logger.warn("La clave secreta debería tener al menos 32 caracteres", {
      currentLength: SECRET_KEY.length
    });
  }

  // Configuración validada
  env = {
    port: validatePort(PORT),
    db_url: DB_URL,
    secret_key: SECRET_KEY,
    slack_webhook: SLACK_WEBHOOK,
    node_env: NODE_ENV as EnvConfig["node_env"],
    log_level: LOG_LEVEL as EnvConfig["log_level"]
  };

  logger.info("Variables de entorno cargadas correctamente", {
    port: env.port,
    node_env: env.node_env,
    log_level: env.log_level
  });

} catch (error) {
  logger.error("Error fatal en la configuración de entorno", {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
}

// Export the configuration after the try-catch block
export { env };
