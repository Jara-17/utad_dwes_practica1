import FollowersRepository from "../repositories/FollowersRepository";
import Followers, { IFollowers } from "../models/Followers";
import {
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from "../errors/exceptions.errors";
import { Types } from "mongoose";
import logger from "../utils/logger.util";

interface FollowerStats {
  followers: number;
  following: number;
}

class FollowersService {
  /**
   * Crea una nueva relación de seguimiento.
   * @param {string} followerId - ID del usuario que sigue.
   * @param {string} followingId - ID del usuario que se sigue.
   * @returns {Promise<IFollowers>} - La relación de seguimiento creada.
   * @throws {ConflictException} - Si la relación de seguimiento ya existe o si intenta seguirse a sí mismo.
   * @throws {InternalServerErrorException} - Si ocurre un error al crear la relación de seguimiento.
   */
  async createFollower(
    followerId: string,
    followingId: string
  ): Promise<IFollowers> {
    try {
      if (followerId === followingId) {
        throw new ConflictException("No puedes seguirte a ti mismo.");
      }

      // Verificar si la relación de seguimiento ya existe
      const existingFollow = await FollowersRepository.findOne(
        followerId,
        followingId
      );

      if (existingFollow) {
        throw new ConflictException("Ya sigues a este usuario.");
      }

      const followerData = {
        follower: new Types.ObjectId(followerId),
        following: new Types.ObjectId(followingId),
      };

      logger.info("Creating follower", { followerData });

      return await FollowersRepository.create(followerData);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw new InternalServerErrorException("ID de usuario inválido.");
      }
      throw new InternalServerErrorException(
        "Error al crear la relación de seguimiento."
      );
    }
  }

  /**
   * Obtiene todos los seguidores de un usuario.
   * @param {string} userId - ID del usuario del que se quieren obtener los seguidores.
   * @returns {Promise<IFollowers[]>} - Una lista de relaciones de seguidores.
   * @throws {NotFoundException} - Si el ID de usuario es inválido.
   * @throws {InternalServerErrorException} - Si ocurre un error al obtener los seguidores.
   */
  async getFollowers(userId: string): Promise<IFollowers[]> {
    try {
      return await FollowersRepository.findFollowers(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Error al obtener los seguidores."
      );
    }
  }

  /**
   * Obtiene los usuarios seguidos por un usuario.
   * @param {string} userId - ID del usuario
   * @returns {Promise<IFollowers[]>} Lista de usuarios seguidos
   */
  async getFollowing(userId: string): Promise<IFollowers[]> {
    try {
      const following = await FollowersRepository.findFollowing(userId);
      logger.info("Following retrieved", { 
        userId, 
        followingCount: following.length,
        followingData: JSON.stringify(following)
      });
      return following;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logger.error("Error retrieving following", {
        userId,
        error: error.message,
        stack: error.stack
      });
      throw new InternalServerErrorException("No se pudieron obtener los usuarios seguidos");
    }
  }

  /**
   * Obtiene las estadísticas de seguidores de un usuario.
   * @param {string} userId - ID del usuario.
   * @returns {Promise<FollowerStats>} - Estadísticas de seguidores.
   * @throws {NotFoundException} - Si el ID de usuario es inválido.
   * @throws {InternalServerErrorException} - Si ocurre un error al obtener las estadísticas.
   */
  async getStats(userId: string): Promise<FollowerStats> {
    try {
      const [followers, following] = await Promise.all([
        FollowersRepository.countFollowers(userId),
        FollowersRepository.countFollowing(userId),
      ]);

      return { followers, following };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Error al obtener las estadísticas de seguidores."
      );
    }
  }

  /**
   * Verifica si un usuario sigue a otro.
   * @param {string} followerId - ID del usuario seguidor.
   * @param {string} followingId - ID del usuario seguido.
   * @returns {Promise<boolean>} - True si el usuario sigue al otro, false en caso contrario.
   * @throws {InternalServerErrorException} - Si ocurre un error al verificar la relación.
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const follow = await FollowersRepository.findOne(followerId, followingId);
      return !!follow;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Error al verificar la relación de seguimiento."
      );
    }
  }

  /**
   * Elimina una relación de seguimiento.
   * @param {string} id - Id del seguimiento
   * @throws {NotFoundException} - Si la relación de seguimiento no se encuentra.
   * @throws {InternalServerErrorException} - Si ocurre un error al eliminar la relación de seguimiento.
   */
  async deleteFollower(id: string): Promise<void> {
    try {
      await FollowersRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Error al eliminar la relación de seguimiento."
      );
    }
  }
}

export default new FollowersService();
