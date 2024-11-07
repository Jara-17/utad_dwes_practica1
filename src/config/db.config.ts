import mongoose from "mongoose";
import colors from "colors";
import { exit } from "node:process";

export const connectDB = async () => {
  try {
    //? Conectar a la base de datos
    const { connection } = await mongoose.connect(process.env.DB_URL);
    const url = `${connection.host}:${connection.port}`;
    console.log(colors.blue.bold(`MongoDB conectado en: ${url}`));
  } catch (error) {
    // console.log(colors.red(error.message));
    console.log(colors.red.bold("Error al conectar con MongoDB"));
    exit(1);
  }
};
