import { Request, Response } from "express";
import PostService from "../services/PostService";
import { bold } from "colors";
import {
  NotFoundException,
  InternalServerErrorException,
} from "../errors/exceptions.errors";
import {
  HttpStatus,
  sendHttpError,
  sendHttpResponse,
} from "../utils/httpResponse.util";
import logger from "../utils/logger.util";

export class PostController {
  static createPost = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const post = req.body;

    try {
      await PostService.createPost(userId.toString(), post);
      sendHttpResponse({
        res,
        status: 201,
        message: "Post creado con éxito.",
      });
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        logger.error(
          `[createPost] -> Error al crear el post: ${bold.red(error.message)}`
        );
        sendHttpError({
          res,
          message: error.message,
        });
      } else {
        logger.error(
          `[createPost] -> Error al crear el post: ${bold.red(error.message)}`
        );
        sendHttpError({
          res,
          status: HttpStatus.BAD_REQUEST,
          message: error.message,
        });
      }
    }
  };

  static getAllPosts = async (req: Request, res: Response) => {
    try {
      const posts = await PostService.getAllPosts();
      sendHttpResponse({
        res,
        data: posts,
      });
    } catch (error) {
      logger.error(
        `[getAllPosts] -> Error al obtener los posts: ${bold.red(
          error.message
        )}`
      );
      sendHttpError({
        res,
        message: error.message,
      });
    }
  };

  static getPostById = async (req: Request, res: Response) => {
    const { postId } = req.params;

    try {
      const post = await PostService.getPostById(postId);
      sendHttpResponse({
        res,
        data: post,
      });
    } catch (error) {
      logger.error(
        `[getPostById] -> Error al obtener el post: ${bold.red(error.message)}`
      );
      if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        sendHttpError({
          res,
          message: error.message,
        });
      }
    }
  };

  static updatePost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const post = req.body;

    try {
      await PostService.updatePost(id, post);
      sendHttpResponse({
        res,
        message: "Post actualizado con éxito",
      });
    } catch (error) {
      logger.error(
        `[updatePost] -> Error al actualizar el post: ${bold.red(
          error.message
        )}`
      );
      if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        sendHttpError({
          res,
          message: error.message,
        });
      }
    }
  };

  static deletePost = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await PostService.deletePost(id);
      sendHttpResponse({
        res,
        message: "Post eliminado con éxito",
      });
    } catch (error) {
      logger.error(`Error al eliminar el post: ${bold.red(error.message)}`);
      if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        sendHttpError({
          res,
          message: error.message,
        });
      }
    }
  };
}
