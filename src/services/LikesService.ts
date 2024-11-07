import LikesRepository from "../repositories/LikesRepository";
import Likes, { ILikes } from "../models/Likes";
import {
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from "../errors/exceptions.errors";
import { Types } from "mongoose";
import { check } from "express-validator";
import { checkLikeExistById } from "../utils/validations.utils";

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
      // Verificar si el like ya existe (opcional, dependiendo de la lógica de negocio)
      const existingLike = await LikesRepository.findOne(userId, postId);
      if (existingLike) {
        throw new ConflictException("Ya has dado like a este post.");
      }

      const likeData = new Likes({
        user: new Types.ObjectId(userId),
        post: new Types.ObjectId(postId),
      });
      return await LikesRepository.create(likeData);
    } catch (error) {
      throw new InternalServerErrorException("Error al crear el like.");
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
      await this.validateLikeExist(id);
      return await LikesRepository.findById(id);
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
      this.validateLikeExist(id);
      await LikesRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException("Error al eliminar el like.");
    }
  }

  private async validateLikeExist(id: string) {
    const likeExist = await checkLikeExistById(id);
    if (!likeExist) {
      throw new NotFoundException("Like no encontrado.");
    }
  }
}

export default new LikesService();
