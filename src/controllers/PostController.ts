import { Request, Response } from "express";
import PostService from "../services/PostService";
import {
  NotFoundException,
  BadRequestException,
  ConflictException
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
    const postData = req.body;

    try {
      const createdPost = await PostService.createPost(userId.toString(), postData);
      logger.info("Post creado con éxito", { postId: createdPost.id });
      sendHttpResponse({
        res,
        status: HttpStatus.CREATED,
        message: "Post creado con éxito",
        data: createdPost
      });
    } catch (error) {
      logger.error("Error en createPost", { 
        error: error.message,
        userId,
        postData: { ...postData, content: undefined } // No logueamos el contenido por privacidad
      });

      if (error instanceof BadRequestException) {
        sendHttpError({
          res,
          status: HttpStatus.BAD_REQUEST,
          message: "Error en la solicitud",
          errors: [error.message]
        });
      } else if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: "Recurso no encontrado",
          errors: [error.message]
        });
      } else {
        sendHttpError({
          res,
          message: "Error interno al crear el post",
          errors: [error.message]
        });
      }
    }
  };

  static getAllPosts = async (_req: Request, res: Response) => {
    try {
      const posts = await PostService.getAllPosts();
      logger.info("Posts recuperados con éxito", { count: posts.length });
      sendHttpResponse({
        res,
        data: posts
      });
    } catch (error) {
      logger.error("Error en getAllPosts", { error: error.message });
      sendHttpError({
        res,
        message: "Error al obtener los posts",
        errors: [error.message]
      });
    }
  };

  static getPostById = async (req: Request, res: Response) => {
    const { postId } = req.params;

    try {
      const post = await PostService.getPostById(postId);
      logger.info("Post recuperado con éxito", { postId });
      sendHttpResponse({
        res,
        data: post
      });
    } catch (error) {
      logger.error("Error en getPostById", { error: error.message, postId });

      if (error instanceof BadRequestException) {
        sendHttpError({
          res,
          status: HttpStatus.BAD_REQUEST,
          message: "Error en la solicitud",
          errors: [error.message]
        });
      } else if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: "Recurso no encontrado",
          errors: [error.message]
        });
      } else {
        sendHttpError({
          res,
          message: "Error al obtener el post",
          errors: [error.message]
        });
      }
    }
  };

  static updatePost = async (req: Request, res: Response) => {
    const { postId } = req.params;
    const userId = req.user._id;
    const postData = req.body;

    try {
      const updatedPost = await PostService.updatePost(postId, userId.toString(), postData);
      logger.info("Post actualizado con éxito", { postId });
      sendHttpResponse({
        res,
        message: "Post actualizado con éxito",
        data: updatedPost
      });
    } catch (error) {
      logger.error("Error en updatePost", { 
        error: error.message, 
        postId,
        userId,
        postData: { ...postData, content: undefined }
      });

      if (error instanceof BadRequestException) {
        sendHttpError({
          res,
          status: HttpStatus.BAD_REQUEST,
          message: "Error en la solicitud",
          errors: [error.message]
        });
      } else if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: "Recurso no encontrado",
          errors: [error.message]
        });
      } else if (error instanceof ConflictException) {
        sendHttpError({
          res,
          status: HttpStatus.FORBIDDEN,
          message: "Acceso denegado",
          errors: [error.message]
        });
      } else {
        sendHttpError({
          res,
          message: "Error al actualizar el post",
          errors: [error.message]
        });
      }
    }
  };

  static deletePost = async (req: Request, res: Response) => {
    const { postId } = req.params;
    const userId = req.user._id;

    try {
      await PostService.deletePost(postId, userId.toString());
      logger.info("Post eliminado con éxito", { postId });
      sendHttpResponse({
        res,
        message: "Post eliminado con éxito"
      });
    } catch (error) {
      logger.error("Error en deletePost", { error: error.message, postId, userId });

      if (error instanceof BadRequestException) {
        sendHttpError({
          res,
          status: HttpStatus.BAD_REQUEST,
          message: "Error en la solicitud",
          errors: [error.message]
        });
      } else if (error instanceof NotFoundException) {
        sendHttpError({
          res,
          status: HttpStatus.NOT_FOUND,
          message: "Recurso no encontrado",
          errors: [error.message]
        });
      } else if (error instanceof ConflictException) {
        sendHttpError({
          res,
          status: HttpStatus.FORBIDDEN,
          message: "Acceso denegado",
          errors: [error.message]
        });
      } else {
        sendHttpError({
          res,
          message: "Error al eliminar el post",
          errors: [error.message]
        });
      }
    }
  };
}
