import type { NextFunction, Request, Response } from "express";
import { param, validationResult } from "express-validator";
import { IPost } from "../models/Post";
import PostRepository from "../repositories/PostRepository";
import {
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from "../errors/exceptions.errors";
import { HttpStatus, sendHttpError } from "../utils/httpResponse.util";
import logger from "../utils/logger.util";

declare global {
  namespace Express {
    interface Request {
      post: IPost;
    }
  }
}

/**
 * Middleware para validar que el ID del post tenga un formato válido
 */
export const validatePostId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await param("postId")
      .isMongoId()
      .withMessage("El ID del post no tiene un formato válido")
      .bail()
      .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      logger.warn("ID de post inválido", { 
        postId: req.params.postId, 
        errors: errorMessages 
      });
      
      throw new BadRequestException(errorMessages[0]);
    }

    next();
  } catch (error) {
    logger.error("Error en validatePostId", { 
      error: error.message,
      postId: req.params.postId 
    });

    if (error instanceof BadRequestException) {
      sendHttpError({
        res,
        status: HttpStatus.BAD_REQUEST,
        message: error.message
      });
    } else {
      sendHttpError({
        res,
        message: "Error al validar el ID del post"
      });
    }
  }
};

/**
 * Middleware para verificar que el post existe
 */
export const validatePostExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;
    const post = await PostRepository.findById(postId);

    if (!post) {
      logger.warn("Post no encontrado", { postId });
      throw new NotFoundException(`Post con ID ${postId} no encontrado`);
    }

    req.post = post;
    logger.debug("Post encontrado y añadido a la request", { postId });
    next();
  } catch (error) {
    logger.error("Error en validatePostExists", { 
      error: error.message,
      postId: req.params.postId 
    });

    if (error instanceof NotFoundException) {
      sendHttpError({
        res,
        status: HttpStatus.NOT_FOUND,
        message: error.message
      });
    } else {
      sendHttpError({
        res,
        message: "Error al verificar la existencia del post"
      });
    }
  }
};

/**
 * Middleware para verificar que el usuario tiene acceso al post
 */
export const hasAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postUserId = req.post.user._id.toString();
    const currentUserId = req.user._id.toString();

    if (postUserId !== currentUserId) {
      logger.warn("Intento de acceso no autorizado a post", {
        postId: req.post._id,
        postUserId,
        currentUserId
      });
      
      throw new UnauthorizedException("No tienes permiso para realizar esta acción");
    }

    logger.debug("Acceso autorizado al post", { 
      postId: req.post._id,
      userId: currentUserId 
    });
    next();
  } catch (error) {
    logger.error("Error en hasAccess", { 
      error: error.message,
      postId: req.post._id,
      userId: req.user._id 
    });

    if (error instanceof UnauthorizedException) {
      sendHttpError({
        res,
        status: HttpStatus.UNAUTHORIZED,
        message: error.message
      });
    } else {
      sendHttpError({
        res,
        message: "Error al verificar permisos de acceso"
      });
    }
  }
};
