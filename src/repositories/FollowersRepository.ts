import { Types } from "mongoose";
import Followers, { IFollowers } from "../models/Followers";
import { NotFoundException } from "../errors/exceptions.errors";
import logger from "../utils/logger.util";

class FollowersRepository {
  private toObjectId(id: string): Types.ObjectId {
    try {
      return new Types.ObjectId(id);
    } catch (error) {
      throw new NotFoundException("ID inválido");
    }
  }

  /**
   * Crea una nueva relación de seguimiento.
   * @param {Partial<IFollowers>} followerData - Datos de la relación de seguimiento a crear.
   * @returns {Promise<IFollowers>} - Una promesa que resuelve a la relación de seguimiento creada.
   */
  async create(followerData: Partial<IFollowers>): Promise<IFollowers> {
    const follower = new Followers(followerData);
    return await follower.save();
  }

  /**
   * Encuentra todos los seguidores de un usuario.
   * @param {string} userId - ID del usuario del que se quieren obtener los seguidores.
   * @returns {Promise<IFollowers[]>} - Una promesa que resuelve a un array de relaciones de seguidores.
   */
  async findFollowers(userId: string): Promise<IFollowers[]> {
    const id = this.toObjectId(userId);
    logger.info(`Searching followers for user with ID: ${id}`, {
      userId,
    });
    return await Followers.find({ following: id })
      .select("follower")
      .populate({
        path: "follower",
        select: "_id username email fullname",
      });
  }

  /**
   * Cuenta el número de seguidores de un usuario.
   * @param {string} userId - ID del usuario.
   * @returns {Promise<number>} - Número de seguidores.
   */
  async countFollowers(userId: string): Promise<number> {
    const id = this.toObjectId(userId);
    return await Followers.countDocuments({ following: id });
  }

  /**
   * Encuentra todos los usuarios que sigue un usuario.
   * @param {string} userId - ID del usuario del que se quieren obtener los seguidos.
   * @returns {Promise<IFollowers[]>} - Una promesa que resuelve a un array de relaciones de seguimiento.
   */
  async findFollowing(userId: string): Promise<IFollowers[]> {
    const id = this.toObjectId(userId);
    return await Followers.find({ follower: id })
      .select("following")
      .populate({
        path: "following",
        select: "_id username email fullname",
      });
  }

  /**
   * Cuenta el número de usuarios que sigue un usuario.
   * @param {string} userId - ID del usuario.
   * @returns {Promise<number>} - Número de usuarios seguidos.
   */
  async countFollowing(userId: string): Promise<number> {
    const id = this.toObjectId(userId);
    return await Followers.countDocuments({ follower: id });
  }

  /**
   * Encuentra una relación de seguimiento específica.
   * @param {string} followerId - ID del seguidor.
   * @param {string} followingId - ID del seguido.
   * @returns {Promise<IFollowers | null>} - Una promesa que resuelve a la relación de seguimiento encontrada o null si no existe.
   */
  async findOne(
    followerId: string,
    followingId: string
  ): Promise<IFollowers | null> {
    return await Followers.findOne({
      follower: this.toObjectId(followerId),
      following: this.toObjectId(followingId),
    });
  }

  /**
   * Encuentra una relación de seguimiento por su ID.
   * @param {string} id - ID de la relación de seguimiento
   * @returns {Promise<IFollowers | null>} - Una promesa que resuelve a la relación de seguimiento encontrada o null si no existe.
   */
  async findById(id: string): Promise<IFollowers | null> {
    return await Followers.findById(this.toObjectId(id));
  }

  /**
   * Elimina una relación de seguimiento por su ID.
   * @param {string} id - ID de la relación de seguimiento a eliminar.
   * @returns {Promise<IFollowers | null>} - La relación eliminada o null si no existía.
   * @throws {NotFoundException} - Si no se encuentra la relación de seguimiento.
   */
  async delete(id: string): Promise<IFollowers | null> {
    const deleted = await Followers.findByIdAndDelete(this.toObjectId(id));
    if (!deleted) {
      throw new NotFoundException("Relación de seguimiento no encontrada");
    }
    return deleted;
  }
}

export default new FollowersRepository();
