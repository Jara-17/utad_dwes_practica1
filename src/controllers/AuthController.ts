import { Request, Response } from "express";
import UserService from "../services/UserService";
import { bold } from "colors";
import {
  NotFoundException,
  ConflictException,
} from "../errors/exceptions.errors";
import {
  HttpStatus,
  sendHttpError,
  sendHttpResponse,
} from "../utils/httpResponse.util";
import logger from "../utils/logger.util";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const user = req.body;

    try {
      await UserService.createUser(user);
      sendHttpResponse({
        res,
        status: HttpStatus.CREATED,
        message: `Cuenta creada con éxito!`,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        sendHttpError({
          res,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
        });
      } else {
        logger.error(
          `[createAccount] -> Error al crear la cuenta: ${bold.red(
            error.message
          )}`
        );
        sendHttpError({
          res,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    }
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const token = await UserService.login(email, password);
      sendHttpResponse({
        res,
        message: "Inicio de sesión exitoso!",
        data: { token },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else if (error instanceof ConflictException) {
        sendHttpError({
          res,
          status: HttpStatus.CONFLICT,
          message: error.message,
        });
      } else {
        logger.error(
          `[login] -> Error al iniciar sesión: ${bold.red(error.message)}`
        );
        sendHttpError({
          res,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    }
  };

  static getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await UserService.getUsers();
      sendHttpResponse({
        res,
        data: users,
      });
    } catch (error) {
      logger.error(
        `[getAllUsers] -> Error al iniciar sesión: ${bold.red(error.message)}`
      );
      sendHttpError({
        res,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  };

  static getUserById = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const user = await UserService.getUserById(userId);
      sendHttpResponse({
        res,
        data: user,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        logger.error(
          `[getUserById] -> Error al obtener el usuario: ${bold.red(
            error.message
          )}`
        );
        sendHttpError({
          res,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    }
  };

  static updateUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = req.body;

    try {
      await UserService.updateUser(userId, user);
      sendHttpResponse({
        res,
        message: `Usuario actualizado con éxito!`,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        logger.error(
          `[updateUser] -> Error al actualizar el usuario: ${bold.red(
            error.message
          )}`
        );
        sendHttpError({
          res,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    }
  };

  static deleteUser = async (req: Request, res: Response) => {
    const { id } = req.user;

    try {
      await UserService.deleteUser(id);
      sendHttpResponse({
        res,
        message: "Cuenta eliminada con éxito!",
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        logger.error(
          `[deleteUser] -> Error al eliminar la cuenta: ${bold.red(
            error.message
          )}`
        );
        sendHttpError({
          res,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    }
  };
}
