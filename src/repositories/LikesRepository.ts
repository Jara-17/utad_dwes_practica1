import Likes, { ILikes } from "../models/Likes";

class LikesRepository {
  /**
   * Crea un nuevo like.
   * @param {Partial<ILikes>} likeData - Datos del like a crear.
   * @returns {Promise<ILikes>} - Una promesa que resuelve al like creado.
   */
  async create(likeData: Partial<ILikes>): Promise<ILikes> {
    const like = new Likes(likeData);
    return await like.save();
  }

  /**
   * Encuentra todos los likes.
   * @returns {Promise<ILikes[]>} - Una promesa que resuelve a un array de likes.
   */
  async findAll(): Promise<ILikes[]> {
    return await Likes.find()
      .populate({
        path: "user",
        select: "_id username email fullname description",
      })
      .populate({
        path: "post",
        select: "content",
      });
  }

  /**
   * Encuentra un like por su ID.
   * @param {string} id - ID del like a encontrar.
   * @returns {Promise<ILikes | null>} - Una promesa que resuelve al like encontrado o null si no existe.
   */
  async findById(id: string): Promise<ILikes | null> {
    return await Likes.findById(id)
      .populate({
        path: "user",
        select: "_id username email fullname description",
      })
      .populate({
        path: "post",
        select: "content",
      });
  }

  /**
   * Encuentra un like por el ID del usuario y el ID del post.
   * @param {string} userId - ID del usuario.
   * @param {string} postId - ID del post.
   * @returns {Promise<ILikes | null>} - Una promesa que resuelve al like encontrado o null si no existe.
   */
  async findOne(userId: string, postId: string): Promise<ILikes | null> {
    return await Likes.findOne({ user: userId, post: postId });
  }

  /**
   * Encuentra likes por el ID del usuario.
   * @param {string} userId - ID del usuario.
   * @returns {Promise<ILikes[]>} - Una promesa que resuelve a un array de likes del usuario.
   */
  async findByUserId(userId: string): Promise<ILikes[]> {
    return await Likes.find({ user: userId });
  }

  /**
   * Encuentra likes por el ID del post.
   * @param {string} postId - ID del post.
   * @returns {Promise<ILikes[]>} - Una promesa que resuelve a un array de likes del post.
   */
  async findByPostId(postId: string): Promise<ILikes[]> {
    return await Likes.find({ post: postId });
  }

  /**
   * Elimina un like por su ID.
   * @param {string} id - ID del like a eliminar.
   * @returns {Promise<void>} - Una promesa que se resuelve cuando el like es eliminado.
   */
  async delete(id: string): Promise<void> {
    await Likes.findByIdAndDelete(id);
  }
}

export default new LikesRepository();
