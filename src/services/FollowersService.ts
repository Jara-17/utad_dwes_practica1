import FollowersRepository from "../repositories/FollowersRepository";
import Followers, { IFollowers } from "../models/Followers";
import {
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from "../errors/exceptions.errors";
import { Types } from "mongoose";

class FollowersService {
  /**
   * Crea una nueva relación de seguimiento.
   * @param {string} followerId - ID del usuario que sigue.
   * @param {string} followingId - ID del usuario que se sigue.
   * @returns {Promise<IFollowers>} - La relación de seguimiento creada.
   * @throws {ConflictException} - Si la relación de seguimiento ya existe.
   * @throws {InternalServerErrorException} - Si ocurre un error al crear la relación de seguimiento.
   */
  async createFollower(
    followerId: string,
    followingId: string
  ): Promise<IFollowers> {
    try {
      // Verificar si la relación de seguimiento ya existe
      const existingFollow = await FollowersRepository.findOne(
        followerId,
        followingId
      );
      if (existingFollow) {
        throw new ConflictException("Ya sigues a este usuario.");
      }

      const followerData: IFollowers = new Followers({
        follower: new Types.ObjectId(followerId),
        following: new Types.ObjectId(followingId),
      });
      return await FollowersRepository.create(followerData);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Propagar el error de conflicto
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
   * @throws {InternalServerErrorException} - Si ocurre un error al obtener los seguidores.
   */
  async getFollowers(userId: string): Promise<IFollowers[]> {
    try {
      return await FollowersRepository.findFollowers(userId);
    } catch (error) {
      throw new InternalServerErrorException(
        "Error al obtener los seguidores."
      );
    }
  }

  /**
   * Obtiene todos los usuarios que sigue un usuario.
   * @param {string} userId - ID del usuario del que se quieren obtener los seguidos.
   * @returns {Promise<IFollowers[]>} - Una lista de relaciones de seguimiento.
   * @throws {InternalServerErrorException} - Si ocurre un error al obtener los seguidos.
   */
  async getFollowing(userId: string): Promise<IFollowers[]> {
    try {
      return await FollowersRepository.findFollowing(userId);
    } catch (error) {
      throw new InternalServerErrorException("Error al obtener los seguidos.");
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
      const existingFollow = await FollowersRepository.findOneById(id);
      if (!existingFollow) {
        throw new NotFoundException("Relación de seguimiento no encontrada.");
      }
      await FollowersRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Propagar el error de no encontrado
      }
      throw new InternalServerErrorException(
        "Error al eliminar la relación de seguimiento."
      );
    }
  }
}

export default new FollowersService();
