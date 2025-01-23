import mongoose from "mongoose";
import colors from "colors";
import { exit } from "node:process";
import logger from "../utils/logger.util";
import { env } from "./env.config";

// Opciones de conexión de MongoDB
const mongooseOptions = {
  autoIndex: true, // Construir índices
  maxPoolSize: 10, // Mantener hasta 10 conexiones socket
  serverSelectionTimeoutMS: 5000, // Tiempo de espera para selección de servidor
  socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
  family: 4 // Usar IPv4, omitir IPv6
};

// Manejar eventos de conexión
mongoose.connection.on("connected", () => {
  logger.info(colors.blue("Mongoose: conexión establecida"));
});

mongoose.connection.on("disconnected", () => {
  logger.warn(colors.yellow("Mongoose: conexión perdida"));
});

mongoose.connection.on("error", (err) => {
  logger.error(colors.red(`Mongoose: error de conexión: ${err}`));
});

// Función para cerrar la conexión de forma limpia
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info(colors.blue("MongoDB desconectado correctamente"));
  } catch (error) {
    logger.error(colors.red(`Error al desconectar MongoDB: ${error.message}`));
    throw error;
  }
};

export const connectDB = async () => {
  try {
    //? Conectar a la base de datos
    const { connection } = await mongoose.connect(env.db_url, mongooseOptions);
    const url = `${connection.host}:${connection.port}`;
    logger.info(colors.blue.bold(`MongoDB conectado en: ${url}`));

    // Manejar señales de terminación
    process.on("SIGINT", async () => {
      await disconnectDB();
      exit(0);
    });
  } catch (error) {
    logger.error(
      colors.red.bold(`Error al conectar a la base de datos: ${error.message}`)
    );
    exit(1);
  }
};
