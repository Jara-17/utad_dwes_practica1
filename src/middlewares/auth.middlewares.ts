import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser } from "../models/User";
import { sendHttpError, sendHttpResponse } from "../utils/httpResponse.util";
import { env } from "../config/env.config";
import UserRepository from "../repositories/UserRepository";
import { UnauthorizedException, NotFoundException, BadRequestException } from "../errors/exceptions.errors";
import { HttpStatus } from "../utils/httpResponse.util";
import logger from "../utils/logger.util";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Log inicial de la solicitud
    logger.debug("Iniciando autenticación", {
      method: req.method,
      url: req.originalUrl,
      headers: {
        authorization: req.headers.authorization ? 'PRESENT' : 'MISSING'
      }
    });

    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith("Bearer ")) {
      logger.warn("Token no válido o ausente", { 
        bearerHeader: bearer 
      });
      throw new UnauthorizedException("Token no válido");
    }

    const token = bearer.split(" ")[1];

    // Log de token recibido
    logger.debug("Token recibido", { 
      tokenLength: token.length,
      tokenStart: token.substring(0, 10) + '...'
    });

    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, env.secret_key) as JwtPayload;
      
      // Log de token decodificado
      logger.debug("Token decodificado", { 
        tokenId: decoded.id,
        tokenExp: decoded.exp 
      });
    } catch (error) {
      logger.error("Error al verificar token", { 
        errorName: error.name,
        errorMessage: error.message
      });
      throw new UnauthorizedException("Token no válido");
    }

    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      logger.warn("Estructura de token inválida", { decoded });
      throw new UnauthorizedException("Token no válido");
    }

    // Log de búsqueda de usuario
    logger.debug("Buscando usuario", { 
      userId: decoded.id,
      visibility: "private"
    });

    const user = await UserRepository.findById(decoded.id, {
      visibility: "private", 
      includeDeleted: true
    });

    // Log de resultado de búsqueda de usuario
    if (!user) {
      logger.error("Usuario no encontrado", { 
        userId: decoded.id,
        tokenPayload: decoded
      });
      throw new NotFoundException("Usuario no encontrado");
    }

    if (user.isDeleted) {
      logger.warn("Intento de autenticación con cuenta eliminada", { 
        userId: decoded.id,
        deletedAt: user.deletedAt
      });
      throw new UnauthorizedException("Token no válido");
    }

    // Log de usuario autenticado
    logger.info("Usuario autenticado exitosamente", {
      userId: user._id,
      username: user.username,
      email: user.email
    });

    req.user = user;
    next();
  } catch (error) {
    // Log de error de autenticación
    logger.error("Error en proceso de autenticación", {
      errorName: error.constructor.name,
      errorMessage: error.message,
      stack: error.stack
    });

    if (error instanceof UnauthorizedException) {
      return sendHttpError({
        res,
        status: HttpStatus.UNAUTHORIZED,
        message: error.message,
      });
    }
    if (error instanceof NotFoundException) {
      return sendHttpError({
        res,
        status: HttpStatus.NOT_FOUND,
        message: error.message,
      });
    }

    return sendHttpError({
      res,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Error interno del servidor",
    });
  }
}

// Middleware para validar resultados
export const validateResults = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestException(
        errors.array().map((error) => error.msg).join(", ")
      );
    }
    next();
  } catch (error) {
    if (error instanceof BadRequestException) {
      return sendHttpError({
        res,
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
    return sendHttpError({
      res,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Error interno del servidor",
    });
  }
};
