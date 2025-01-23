import LikesRepository from "../repositories/LikesRepository";
import Likes, { ILikes } from "../models/Likes";
import {
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from "../errors/exceptions.errors";
import { Types } from "mongoose";
import PostRepository from "../repositories/PostRepository";
import logger from "../utils/logger.util";

class LikesService {
  /**
   * Crea un nuevo like.
   * @param {string} userId - ID del usuario que da el like.
   * @param {string} postId - ID del post que recibe el like.
   * @returns {Promise<ILikes>} - El like creado.
   * @throws {ConflictException} - Si el like ya existe.
   * @throws {InternalServerErrorException} - Si ocurre un error al crear el like.
   */
  async createLike(userId: string, postId: string): Promise<ILikes> {
    try {
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(postId)) {
        throw new BadRequestException("IDs inválidos");
      }

      const postIdObjectId = new Types.ObjectId(postId);
      const userIdObjectId = new Types.ObjectId(userId);

      // Verificar si el like ya existe
      const existingLike = await LikesRepository.findOne(userIdObjectId, postIdObjectId);
      if (existingLike) {
        throw new ConflictException("Ya has dado like a este post.");
      }

      // Crear el nuevo like
      const likeData = {
        user: userIdObjectId,
        post: postIdObjectId,
      };

      const newLike = await LikesRepository.create(likeData);
      logger.info(`Like creado: ${newLike._id}`);

      const post = await PostRepository.findById(postId);
      logger.info(`Post encontrado: ${post._id}`);
      post.likes.push(newLike._id as Types.ObjectId);
      logger.info(`Like agregado al post: ${post.likes}`);
      await post.save();
      logger.info(`Like agregado al post: ${post._id}`);

      return newLike;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException("Error al crear el like.");
      }
    }
  }

  /**
   * Obtiene todos los likes.
   * @returns {Promise<ILikes[]>} - Una lista de todos los likes.
   * @throws {InternalServerErrorException} - Si ocurre un error al obtener los likes.
   */
  async getAllLikes(): Promise<ILikes[]> {
    try {
      return await LikesRepository.findAll();
    } catch (error) {
      throw new InternalServerErrorException("Error al obtener los likes.");
    }
  }

  /**
   * Obtiene un like por su ID.
   * @param {string} id - ID del like a obtener.
   * @returns {Promise<ILikes>} - El like encontrado.
   * @throws {NotFoundException} - Si el like no se encuentra.
   * @throws {InternalServerErrorException} - Si ocurre un error al obtener el like.
   */
  async getLikeById(id: string): Promise<ILikes> {
    try {
      return await LikesRepository.findById(new Types.ObjectId(id));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Error al obtener el like.");
    }
  }

  /**
   * Elimina un like por su ID.
   * @param {string} id - ID del like a eliminar.
   * @throws {NotFoundException} - Si el like no se encuentra.
   * @throws {InternalServerErrorException} - Si ocurre un error al eliminar el like.
   */
  async deleteLike(id: string): Promise<void> {
    try {
      // Buscar el like correspondiente
      const like = await LikesRepository.findById(new Types.ObjectId(id));
      // Eliminar el like de la lista del post
      const post = await PostRepository.findById(like.post._id.toString());
      post.likes = post.likes.filter((likeId) => likeId.toString() !== id);
      await post.save();
      // Eliminar el like
      await LikesRepository.delete(like.id);
    } catch (error) {
      throw new InternalServerErrorException("Error al eliminar el like.");
    }
  }
}

export default new LikesService();
