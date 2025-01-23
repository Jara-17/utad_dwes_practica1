import type { NextFunction, Request, Response } from "express";
import { param, validationResult } from "express-validator";
import { ILikes } from "../models/Likes";
import LikesRepository from "../repositories/LikesRepository";
import { HttpStatus, sendHttpError } from "../utils/httpResponse.util";
import { NotFoundException } from "../errors/exceptions.errors";
import logger from "../utils/logger.util";
import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      likes?: ILikes;
    }
  }
}

export const validateLikeId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("likeId").isMongoId().withMessage("ID no Válido").bail().run(req);

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendHttpError({
      res,
      status: HttpStatus.BAD_REQUEST,
      message: "Error de validación",
      errors: errors.array().map((error) => error.msg),
    });
  }

  next();
};

export const validateLikeExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { likeId } = req.params;
    const likes = await LikesRepository.findById(new Types.ObjectId(likeId));

    if (!likes) {
      const error = new NotFoundException("Like no encontrado");
      return sendHttpError({
        res,
        status: HttpStatus.NOT_FOUND,
        message: error.message,
      });
    }

    req.likes = likes;

    next();
  } catch (error) {
    logger.error(error.message);
    if (error instanceof NotFoundException) {
      return sendHttpError({
        res,
        status: HttpStatus.NOT_FOUND,
        message: error.message,
      });
    }
    sendHttpError({
      res,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Error al validar el like",
    });
  }
};
