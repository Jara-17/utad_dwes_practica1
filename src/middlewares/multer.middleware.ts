import { Request, Response, NextFunction } from "express";
import { upload } from "../config/multer.config";
import { MulterError } from "multer";
import { HttpStatus, sendHttpError } from "../utils/httpResponse.util";
import logger from "../utils/logger.util";

export const uploadProfilePictureMiddleware = upload.single("profilePicture");

// Middleware genérico para manejar errores de multer
export const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof MulterError) {
    return sendHttpError({
      res,
      status: HttpStatus.BAD_REQUEST,
      message: `Error al procesar la imagen: ${err.message}`,
    });
  }
  if (err) {
    logger.error(err);
    return sendHttpError({
      res,
      message: "Error al procesar la imagen",
      errors: err,
    });
  }
  next();
};
