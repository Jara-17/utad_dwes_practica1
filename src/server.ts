import express, { Express } from "express";
import morgan from "morgan";
import { connectDB } from "./config/db.config";
import usersRoutes from "./routes/users.routes";
import postsRoutes from "./routes/posts.routes";
import morganBody from "morgan-body";
import { HttpStatus } from "./utils/httpResponse.util";
import { loggerStream } from "./config/slack.config";

//* Conexión a la base de datos
connectDB();

//* Iniciamos Express
const app: Express = express();

//* Loggin
app.use(morgan("dev"));
morganBody(app, {
  noColors: true,
  skip: (req, res) => res.statusCode < HttpStatus.INTERNAL_SERVER_ERROR,
  stream: loggerStream,
});

//* Habilitar la lectura en formato json
app.use(express.json());

//* Rutas
app.use("/api/auth", usersRoutes);
app.use("/api/posts", postsRoutes);

export default app;
