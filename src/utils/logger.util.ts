import winston, { format } from "winston";
import { formatDateTime } from "./date.util";
import path from "path";
import fs from "fs";

/**
 * Configuración del logger
 */
interface LoggerConfig {
  level: string;
  dateFormat: string;
  logsDir: string;
  maxFiles: number;
  maxSize: string;
  environment: "development" | "production";
}

/**
 * Configuración por defecto del logger
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.LOG_LEVEL || "info",
  dateFormat: "DD/MM/YYYY HH:mm:ss",
  logsDir: "logs",
  maxFiles: 7,
  maxSize: "10m",
  environment:
    (process.env.NODE_ENV as "development" | "production") || "development",
};

/**
 * Genera el nombre del archivo de log basado en la fecha actual
 */
const getLogFileName = (): string => {
  const now = new Date();
  const formattedDateTime = formatDateTime(now).replace(/[/:/ ]/g, "_");
  return path.join(DEFAULT_CONFIG.logsDir, `log-${formattedDateTime}.log`);
};

/**
 * Asegura que el directorio de logs existe
 */
const ensureLogsDirectory = (): void => {
  if (!fs.existsSync(DEFAULT_CONFIG.logsDir)) {
    fs.mkdirSync(DEFAULT_CONFIG.logsDir, { recursive: true });
  }
};

/**
 * Formato personalizado para los logs
 */
const customFormat = format.printf(
  ({ level, message, timestamp, metadata }) => {
    let msg = `[${timestamp}] ${level}: ${message}`;

    // Extraer los metadatos correctamente sin anidarlos dentro de "metadata"
    if (metadata && Object.keys(metadata).length > 0) {
      msg += ` | ${JSON.stringify(metadata)}`;
    }

    return msg;
  }
);

/**
 * Configuración del formato de los logs
 */
const logFormat = format.combine(
  format.timestamp({ format: DEFAULT_CONFIG.dateFormat }),
  format.metadata({ fillExcept: ["message", "level", "timestamp"] }),
  format.errors({ stack: true }),
  DEFAULT_CONFIG.environment === "development"
    ? format.colorize()
    : format.uncolorize(),
  customFormat
);

// Asegurar que el directorio de logs existe
ensureLogsDirectory();

/**
 * Configuración de los transportes del logger
 */
const transports = [
  // Log en consola
  new winston.transports.Console({
    format: logFormat,
  }),
  // Log en archivo diario
  new winston.transports.File({
    filename: getLogFileName(),
    format: logFormat,
    maxsize: parseInt(DEFAULT_CONFIG.maxSize),
    maxFiles: DEFAULT_CONFIG.maxFiles,
    tailable: true,
  }),
  // Log de errores separado
  new winston.transports.File({
    filename: path.join(DEFAULT_CONFIG.logsDir, "error.log"),
    level: "error",
    format: logFormat,
    maxsize: parseInt(DEFAULT_CONFIG.maxSize),
    maxFiles: DEFAULT_CONFIG.maxFiles,
  }),
];

/**
 * Creación del logger con la configuración establecida
 */
const logger = winston.createLogger({
  level: DEFAULT_CONFIG.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

/**
 * Métodos de logging con tipos mejorados
 */
export interface Logger {
  error(message: string, meta?: object): void;
  warn(message: string, meta?: object): void;
  info(message: string, meta?: object): void;
  debug(message: string, meta?: object): void;
  log(level: string, message: string, meta?: object): void;
}

/**
 * Logger mejorado con métodos tipados
 */
const enhancedLogger: Logger = {
  error: (message: string, meta?: object) => logger.error(message, meta),
  warn: (message: string, meta?: object) => logger.warn(message, meta),
  info: (message: string, meta?: object) => logger.info(message, meta),
  debug: (message: string, meta?: object) => logger.debug(message, meta),
  log: (level: string, message: string, meta?: object) =>
    logger.log(level, message, meta),
};

// Exportar el logger mejorado
export default enhancedLogger;
