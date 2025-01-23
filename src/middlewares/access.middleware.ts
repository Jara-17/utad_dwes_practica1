import type { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../errors/exceptions.errors";
import { HttpStatus, sendHttpError } from "../utils/httpResponse.util";
import { Types } from "mongoose";

/**
 * Tipo que define la estructura de los recursos que pueden ser protegidos
 */
interface ProtectedResource {
  user?: {
    _id: Types.ObjectId;
  };
  follower?: Types.ObjectId;
  following?: Types.ObjectId;
  _id: Types.ObjectId;
}

/**
 * Middleware factory para crear middlewares de control de acceso
 * @param options Opciones de configuración del middleware
 * @returns Middleware configurado para el control de acceso
 */
export const createAccessControl = (options: {
  /**
   * Nombre del parámetro que contiene el ID del recurso
   */
  paramName: string;
  /**
   * Nombre del campo que contiene el recurso en el request
   */
  resourceName?: string;
  /**
   * Función personalizada para verificar el acceso
   */
  customCheck?: (req: Request) => boolean | Promise<boolean>;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id;
      
      // Si hay una función de verificación personalizada, la usamos
      if (options.customCheck) {
        const hasAccess = await options.customCheck(req);
        if (!hasAccess) {
          throw new UnauthorizedException("No tienes permiso para realizar esta acción");
        }
        return next();
      }

      // Si no hay función personalizada, verificamos el acceso basado en el ID del usuario
      const resourceId = req.params[options.paramName];
      
      // Si el ID del recurso es el mismo que el ID del usuario, permitimos el acceso
      if (resourceId === userId.toString()) {
        return next();
      }

      // Si hay un recurso específico en el request, verificamos la propiedad
      if (options.resourceName && req[options.resourceName]) {
        const resource = req[options.resourceName] as ProtectedResource;
        
        // Verificar propiedad del recurso
        const isOwner = resource.user?._id.toString() === userId.toString() ||
                       resource.follower?.toString() === userId.toString() ||
                       resource.following?.toString() === userId.toString();
        
        if (isOwner) {
          return next();
        }
      }

      throw new UnauthorizedException("No tienes permiso para realizar esta acción");
    } catch (error) {
      return sendHttpError({
        res,
        status: error instanceof UnauthorizedException ? HttpStatus.UNAUTHORIZED : HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario tiene acceso a su propio recurso
 */
export const hasUserAccess = createAccessControl({
  paramName: "",
  customCheck: (req: Request) => true,
});

/**
 * Middleware para verificar si el usuario tiene acceso a un recurso de followers
 */
export const hasFollowerAccess = createAccessControl({
  paramName: "followerId",
  customCheck: async (req: Request) => {
    const userId = req.user._id;
    const followerId = req.params.followerId;

    // No se puede seguir a uno mismo
    return userId.toString() !== followerId;
  },
});
