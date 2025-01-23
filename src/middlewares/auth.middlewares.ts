import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser } from "../models/User";
import { sendHttpError, sendHttpResponse } from "../utils/httpResponse.util";
import { env } from "../config/env.config";
import UserRepository from "../repositories/UserRepository";
import { UnauthorizedException, NotFoundException, BadRequestException } from "../errors/exceptions.errors";
import { HttpStatus } from "../utils/httpResponse.util";

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
    const bearer = req.headers.authorization;

    if (!bearer || !bearer.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token no proporcionado o formato inválido");
    }

    const token = bearer.split(" ")[1];
    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, env.secret_key) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException("Token no válido o expirado");
    }

    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      throw new UnauthorizedException("Token malformado");
    }

    const user = await UserRepository.findById(decoded.id, {
      visibility: "private", includeDeleted: false});

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    if (user.isDeleted) {
      throw new UnauthorizedException("Usuario desactivado");
    }

    req.user = user;
    next();
  } catch (error) {
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
