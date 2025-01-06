import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser } from "../models/User";
import { sendHttpError } from "../utils/httpResponse.util";
import { env } from "../config/env.config";
import UserRepository from "../repositories/UserRepository";

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
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
    return sendHttpError({
      res,
      status: 401,
      message: "Token no válido.",
    });
  }

  const token = bearer.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.secret_key) as JwtPayload;

    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return sendHttpError({
        res,
        status: 401,
        message: "Token no válido.",
      });
    }

    const user = await UserRepository.findById(decoded.id);

    if (!user) {
      return sendHttpError({
        res,
        status: 404,
        message: "Usuario no encontrado.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return sendHttpError({
      res,
      status: 401,
      message: "Token no válido.",
      errors: error.message,
    });
  }
}

// Middleware para validar resultados
export const validateResults = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return sendHttpError({
      res,
      status: 400,
      errors: errorMessages,
    });
  }
  next();
};
