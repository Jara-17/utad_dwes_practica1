import express, { Express, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import morganBody from "morgan-body";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.config";
import authRoutes from "./routes/auth.routes";
import postsRoutes from "./routes/posts.routes";
import { HttpStatus } from "./utils/httpResponse.util";
import { loggerStream } from "./config/slack.config";
import { swaggerOptions } from "./config/swagger.config";
import swaggerJSDoc from "swagger-jsdoc";
import logger from "./utils/logger.util";

//* Conexión a la base de datos
connectDB();

//* Iniciamos Express
const app: Express = express();

//* Middlewares de seguridad
app.use(helmet()); // Seguridad básica
app.use(cors()); // Habilitar CORS
app.use(express.json({ limit: "10kb" })); // Limitar tamaño del body

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por ventana
  message: "Demasiadas peticiones desde esta IP, por favor intente más tarde"
});
app.use("/api", limiter);

//* Logging
app.use(morgan("dev"));
morganBody(app, {
  noColors: true,
  skip: (req: Request, res: Response) =>
    res.statusCode < HttpStatus.INTERNAL_SERVER_ERROR,
  stream: loggerStream,
});

//* Habilitamos swagger
// Generar el esquema con swagger-jsdoc
const swaggerSpec = swaggerJSDoc({
  definition: swaggerOptions,
  apis: ["./src/routes/*.ts"], // Ruta a tus archivos de rutas
});

// Habilitar Swagger UI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//* Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

//* Rutas
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);

//* Manejo de rutas no encontradas
app.use("*", (req: Request, res: Response) => {
  res.status(HttpStatus.NOT_FOUND).json({
    status: "error",
    message: `Ruta no encontrada: ${req.originalUrl}`
  });
});

//* Middleware de manejo de errores global
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

export default app;
