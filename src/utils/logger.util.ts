import winston from "winston";
import { formatDateTime } from "./date.util";

// Función que retorna el nombre del archivo de log
const getLogFileName = () => {
  const now = new Date();
  const formattedDateTime = formatDateTime(now).replace(/[/:/ ]/g, "_");
  return `logs/log-${formattedDateTime}.log`;
};

// Configuración de los niveles de log y formato
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  const formattedDate = formatDateTime(new Date(timestamp as string));

  return `[${level}] ${formattedDate}: ${message}`;
});

// Creación del logger
const logger = winston.createLogger({
  level: "info", // Nivel por defecto
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    logFormat
  ),
  transports: [
    // Registro en consola
    new winston.transports.Console(),
    // Registro en un archivo
    new winston.transports.File({
      filename: getLogFileName(),
      options: { encoding: "utf8" },
    }),
  ],
});

export default logger;
