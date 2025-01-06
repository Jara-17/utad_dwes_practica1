import { Request, Response } from "express";
import LikesService from "../services/LikesService";
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

export class LikesController {
  static createLike = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { postId } = req.params;

    try {
      await LikesService.createLike(userId.toString(), postId);
      sendHttpResponse({
        res,
        status: HttpStatus.CREATED,
        message: `Like!`,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        sendHttpError({
          res,
          message: error.message,
        });
      } else {
        logger.error(`Error al crear el like: ${bold.red(error.message)}`);
        sendHttpError({
          res,
          message: error.message,
        });
      }
    }
  };

  static getAllLikes = async (req: Request, res: Response) => {
    try {
      const likes = await LikesService.getAllLikes();
      sendHttpResponse({
        res,
        data: likes,
      });
    } catch (error) {
      logger.error(`Error al obtener los likes: ${bold.red(error.message)}`);
      sendHttpError({
        res,
        message: error.message,
      });
    }
  };

  static getLikeById = async (req: Request, res: Response) => {
    const { likeId } = req.params;

    try {
      const like = await LikesService.getLikeById(likeId);
      sendHttpResponse({
        res,
        data: like,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        logger.error(`Error al obtener el like: ${bold.red(error.message)}`);
        sendHttpError({
          res,
          message: error.message,
        });
      }
    }
  };

  static deleteLike = async (req: Request, res: Response) => {
    const { likeId } = req.params;

    try {
      await LikesService.deleteLike(likeId);
      sendHttpResponse({
        res,
        message: `Like eliminado correctamente`,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        logger.error(`Error al eliminar el like: ${bold.red(error.message)}`);
        sendHttpError({
          res,
          message: error.message,
        });
      }
    }
  };
}

export default LikesController;
