import { Request, Response } from "express";
import UserService from "../services/UserService";
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException
} from "../errors/exceptions.errors";
import { HttpStatus } from "../utils/httpResponse.util";
import { sendHttpResponse, sendHttpError } from "../utils/httpResponse.util";
import logger from "../utils/logger.util";
import { IUser } from "../models/User";

// Interfaces para tipar las peticiones
interface CreateUserRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface UpdateUserRequest extends Request {
  user: IUser;
  body: {
    username?: string;
    email?: string;
    password?: string;
  };
}

interface AuthenticatedRequest extends Request {
  user: IUser;
}

export class AuthController {
  /**
   * Maneja los errores comunes de la aplicación
   */
  private static handleError(error: Error, res: Response, context: string) {
    if (
      error instanceof NotFoundException ||
      error instanceof ConflictException ||
      error instanceof BadRequestException ||
      error instanceof UnauthorizedException
    ) {
      const statusMap = {
        [NotFoundException.name]: HttpStatus.NOT_FOUND,
        [ConflictException.name]: HttpStatus.CONFLICT,
        [BadRequestException.name]: HttpStatus.BAD_REQUEST,
        [UnauthorizedException.name]: HttpStatus.UNAUTHORIZED,
      };

      const status = statusMap[error.constructor.name];
      logger.error(`Error en ${context}: ${error.message}`, {
        errorType: error.constructor.name,
        status,
        stack: error.stack
      });

      return sendHttpError({
        res,
        status,
        message: error.message,
      });
    }

    logger.error(`Error interno del servidor en ${context}`, {
      error: error.message,
      stack: error.stack,
      status: HttpStatus.INTERNAL_SERVER_ERROR
    });

    return sendHttpError({
      res,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Error interno del servidor",
    });
  }

  static async createAccount(req: CreateUserRequest, res: Response) {
    try {
      logger.info("Iniciando creación de cuenta", {
        username: req.body.username,
        email: req.body.email
      });

      await UserService.createUser(req.body);
      
      logger.info("Cuenta creada exitosamente", {
        username: req.body.username,
        email: req.body.email
      });

      sendHttpResponse({
        res,
        status: HttpStatus.CREATED,
        message: "Cuenta creada con éxito!",
      });
    } catch (error) {
      AuthController.handleError(error, res, "createAccount");
    }
  }

  static async login(req: LoginRequest, res: Response) {
    try {
      const { email } = req.body;
      logger.info("Intento de inicio de sesión", { email });

      const token = await UserService.login(email, req.body.password);
      
      logger.info("Inicio de sesión exitoso", { email });

      sendHttpResponse({
        res,
        message: "Inicio de sesión exitoso!",
        data: { token },
      });
    } catch (error) {
      AuthController.handleError(error, res, "login");
    }
  }

  static async getAllUsers(_req: Request, res: Response) {
    try {
      logger.info("Obteniendo lista de usuarios");
      
      const users = await UserService.getUsers();
      
      logger.info("Lista de usuarios obtenida", { count: users.length });

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        data: users,
      });
    } catch (error) {
      AuthController.handleError(error, res, "getAllUsers");
    }
  }

  static async getUserById(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;
      logger.info("Buscando usuario por ID", { userId });

      const user = await UserService.getUserById(userId);
      
      logger.info("Usuario encontrado", { userId, email: user.email });

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        data: user,
      });
    } catch (error) {
      AuthController.handleError(error, res, "getUserById");
    }
  }

  static async updateUser(req: UpdateUserRequest, res: Response) {
    try {
      const userId = req.user.id;
      logger.info("Iniciando actualización de usuario", {
        userId,
        updateFields: Object.keys(req.body)
      });

      await UserService.updateUser(userId, req.body);
      
      logger.info("Usuario actualizado exitosamente", { userId });

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        message: "Usuario actualizado con éxito!",
      });
    } catch (error) {
      AuthController.handleError(error, res, "updateUser");
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.id;
      logger.info("Iniciando eliminación de cuenta", { userId });

      await UserService.deleteUser(userId);
      
      logger.info("Cuenta eliminada exitosamente", { userId });

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        message: "Cuenta eliminada con éxito!",
      });
    } catch (error) {
      AuthController.handleError(error, res, "deleteUser");
    }
  }

  static async uploadProfilePicture(
    req: AuthenticatedRequest & { file?: Express.Multer.File },
    res: Response
  ) {
    try {
      const userId = req.user._id.toString();

      if (!req.file) {
        logger.warn("Intento de subir imagen de perfil sin archivo", { userId });
        throw new BadRequestException("No se ha proporcionado ninguna imagen");
      }

      logger.info("Iniciando subida de imagen de perfil", {
        userId,
        fileName: req.file.filename,
        fileSize: req.file.size
      });

      await UserService.uploadProfilePicture(req.file, userId);
      
      logger.info("Imagen de perfil actualizada exitosamente", {
        userId,
        fileName: req.file.filename
      });

      sendHttpResponse({
        res,
        status: HttpStatus.OK,
        message: "Imagen de perfil actualizada con éxito!",
      });
    } catch (error) {
      AuthController.handleError(error, res, "uploadProfilePicture");
    }
  }
}
