import Followers, { IFollowers } from "../models/Followers";

class FollowersRepository {
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
    return await Followers.find({ following: userId })
      .select("follower")
      .populate({
        path: "follower",
        select: "_id username email fullname",
      });
  }

  /**
   * Encuentra todos los usuarios que sigue un usuario.
   * @param {string} userId - ID del usuario del que se quieren obtener los seguidos.
   * @returns {Promise<IFollowers[]>} - Una promesa que resuelve a un array de relaciones de seguimiento.
   */
  async findFollowing(userId: string): Promise<IFollowers[]> {
    return await Followers.find({ follower: userId })
      .select("following")
      .populate({
        path: "following",
        select: "_id username email fullname",
      });
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
      follower: followerId,
      following: followingId,
    });
  }

  /**
   * Encuentra una relación de seguimiento específica.
   * @param {string} id - ID de la relación de seguimiento
   * @returns {Promise<IFollowers | null>} - Una promesa que resuelve a la relación de seguimiento encontrada o null si no existe.
   */
  async findOneById(id: string): Promise<IFollowers | null> {
    return await Followers.findOne({ _id: id });
  }

  /**
   * Elimina una relación de seguimiento por su ID.
   * @param {string} id - ID de la relación de seguimiento a eliminar.
   * @returns {Promise<void>} - Una promesa que se resuelve cuando la relación de seguimiento es eliminada.
   */
  async delete(id: string): Promise<void> {
    await Followers.findByIdAndDelete(id);
  }
}

export default new FollowersRepository();
