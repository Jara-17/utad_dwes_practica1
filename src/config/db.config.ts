import mongoose from "mongoose";
import colors from "colors";
import { exit } from "node:process";
import logger from "../utils/logger.util";
import { env } from "./env.config";

export const connectDB = async () => {
  try {
    //? Conectar a la base de datos
    const { connection } = await mongoose.connect(env.db_url);
    const url = `${connection.host}:${connection.port}`;
    logger.info(colors.blue.bold(`MongoDB conectado en: ${url}`));
  } catch (error) {
    logger.error(
      colors.red.bold(`Error al conectar a la base de datos: ${error.message}`)
    );
    exit(1);
  }
};
