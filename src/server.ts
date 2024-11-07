import express, { Express } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDB } from "./config/db.config";
import usersRoutes from "./routes/users.routes";
import postsRoutes from "./routes/posts.routes";
import likesRoutes from "./routes/likes.routes";
import followersRoutes from "./routes/followers.routes";
import feedRoutes from "./routes/feed.routes";
//* Habilitamos las bariables de entorno
dotenv.config();

//* Conexión a la base de datos
connectDB();

//* Iniciamos Express
const app: Express = express();

//* Login
app.use(morgan("dev"));

//* Habilitar la lectura en formato json
app.use(express.json());

//* Rutas
app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/follow", followersRoutes);
app.use("/api/feed", feedRoutes);

export default app;
