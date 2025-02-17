import { Request, Response } from "express";
import FollowersService from "../services/FollowersService";
import { bold } from "colors";
import {
  NotFoundException,
  ConflictException,
} from "../errors/exceptions.errors";
import { sendHttpError, sendHttpResponse } from "../utils/httpResponse.util";
import logger from "../utils/logger.util";

export class FollowersController {
  /**
   * Crea una nueva relación de seguimiento.
   * @param {Request} req - La solicitud HTTP.
   * @param {Response} res - La respuesta HTTP.
   */
  static createFollower = async (req: Request, res: Response) => {
    const followerId = req.user._id; // Asumiendo que el ID del seguidor está en req.user
    const { followingId } = req.params; // Asumiendo que el ID del seguido se pasa como parámetro de ruta

    try {
      const follower = await FollowersService.createFollower(
        followerId.toString(),
        followingId
      );
      sendHttpResponse({
        res,
        message: "Siguiendo!.",
        data: follower,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        sendHttpError({
          res,
          message: error.message,
        });
      } else {
        logger.error(
          `Error al crear la relación de seguimiento: ${bold.red(
            error.message
          )}`
        );
        sendHttpError({
          res,
          message: error.message,
        });
      }
    }
  };

  /**
   * Obtiene todos los seguidores de un usuario.
   * @param {Request} req - La solicitud HTTP.
   * @param {Response} res - La respuesta HTTP.
   */
  static getFollowers = async (req: Request, res: Response) => {
    const userId = req.user._id.toString();

    try {
      const followers = await FollowersService.getFollowers(userId);
      sendHttpResponse({
        res,
        data: followers,
      });
    } catch (error) {
      logger.error(
        `Error al obtener los seguidores: ${bold.red(error.message)}`
      );
      sendHttpError({
        res,
        message: error.message,
      });
    }
  };

  /**
   * Obtiene todos los usuarios que sigue un usuario.
   * @param {Request} req - La solicitud HTTP.
   * @param {Response} res - La respuesta HTTP.
   */
  static getFollowing = async (req: Request, res: Response) => {
    const userId = req.user.id.toString();

    try {
      const following = await FollowersService.getFollowing(userId);
      sendHttpResponse({
        res,
        data: following,
      });
    } catch (error) {
      logger.error(`Error al obtener los seguidos: ${bold.red(error.message)}`);
      sendHttpError({
        res,
        message: error.message,
      });
    }
  };

  /**
   * Elimina una relación de seguimiento.
   * @param {Request} req - La solicitud HTTP.
   * @param {Response} res - La respuesta HTTP.
   */
  static deleteFollower = async (req: Request, res: Response) => {
    const { followingId } = req.params;
    logger.info(`Eliminando relación de seguimiento: ${bold(followingId)}`);

    try {
      await FollowersService.deleteFollower(followingId);
      sendHttpResponse({
        res,
        message: "Dejaste de seguir al usuario.",
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          message: error.message,
        });
      } else {
        logger.error(
          `Error al eliminar la relación de seguimiento: ${bold.red(
            error.message
          )}`
        );
        sendHttpError({
          res,
          message: error.message,
        });
      }
    }
  };
}

export default FollowersController;
