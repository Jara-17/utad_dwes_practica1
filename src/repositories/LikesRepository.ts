import mongoose, { Types } from "mongoose";
import Likes, { ILikes } from "../models/Likes";

class LikesRepository {
  /**
   * Crea un nuevo like.
   * @param {Partial<ILikes>} likeData - Datos del like a crear.
   * @returns {Promise<ILikes>} - Una promesa que resuelve al like creado.
   * @throws {Error} Si la creación del like falla.
   */
  async create(likeData: Partial<ILikes>): Promise<ILikes> {
    try {
      // Validar que no exista un like previo
      const existingLike = await Likes.findOne({ 
        user: likeData.user, 
        post: likeData.post 
      });

      if (existingLike) {
        throw new Error('Ya existe un like para este usuario y post');
      }

      const like = new Likes(likeData);
      return await like.save();
    } catch (error) {
      console.error('Error al crear like:', error);
      throw error;
    }
  }

  /**
   * Encuentra todos los likes con población de usuario y post.
   * @returns {Promise<ILikes[]>} - Una promesa que resuelve a un array de likes.
   */
  async findAll(): Promise<ILikes[]> {
    try {
      return await Likes.find()
        .populate({
          path: "user",
          select: "_id username email fullname description",
        })
        .populate({
          path: "post",
          select: "content",
        });
    } catch (error) {
      console.error('Error al buscar likes:', error);
      throw error;
    }
  }

  /**
   * Encuentra un like por su ID con población.
   * @param {Types.ObjectId} id - ID del like a encontrar.
   * @returns {Promise<ILikes | null>} - Una promesa que resuelve al like encontrado o null.
   */
  async findById(id: Types.ObjectId): Promise<ILikes | null> {
    try {
      return await Likes.findById(id)
        .populate({
          path: "user",
          select: "_id username email fullname description",
        })
        .populate({
          path: "post",
          select: "content",
        });
    } catch (error) {
      console.error(`Error al buscar like con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Encuentra un like por el ID del usuario y el ID del post.
   * @param {Types.ObjectId} userId - ID del usuario.
   * @param {Types.ObjectId} postId - ID del post.
   * @returns {Promise<ILikes | null>} - Una promesa que resuelve al like encontrado o null.
   */
  async findOne(
    userId: Types.ObjectId, 
    postId: Types.ObjectId
  ): Promise<ILikes | null> {
    try {
      return await Likes.findOne({ 
        user: userId, 
        post: postId 
      })
    } catch (error) {
      console.error(`Error al buscar like de usuario ${userId} en post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Encuentra likes por el ID del usuario.
   * @param {Types.ObjectId} userId - ID del usuario.
   * @returns {Promise<ILikes[]>} - Una promesa que resuelve a un array de likes del usuario.
   */
  async findByUserId(userId: Types.ObjectId): Promise<ILikes[]> {
    try {
      return await Likes.find({ user: userId })
        .populate({
          path: "post",
          select: "content",
        })
    } catch (error) {
      console.error(`Error al buscar likes de usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Encuentra likes por el ID del post.
   * @param {Types.ObjectId} postId - ID del post.
   * @returns {Promise<ILikes[]>} - Una promesa que resuelve a un array de likes del post.
   */
  async findByPostId(postId: Types.ObjectId): Promise<ILikes[]> {
    try {
      return await Likes.find({ post: postId })
        .populate({
          path: "user",
          select: "_id username email fullname description",
        });
    } catch (error) {
      console.error(`Error al buscar likes del post ${postId}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un like por su ID.
   * @param {Types.ObjectId} id - ID del like a eliminar.
   * @returns {Promise<void>} - Una promesa que se resuelve cuando el like es eliminado.
   */
  async delete(id: Types.ObjectId): Promise<void> {
    try {
      const result = await Likes.findByIdAndDelete(id);
      
      if (!result) {
        throw new Error(`Like con ID ${id} no encontrado`);
      }
    } catch (error) {
      console.error(`Error al eliminar like ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cuenta el número de likes para un post específico.
   * @param {Types.ObjectId} postId - ID del post.
   * @returns {Promise<number>} - Número de likes para el post.
   */
  async countLikesForPost(postId: Types.ObjectId): Promise<number> {
    try {
      return await Likes.countDocuments({ post: postId });
    } catch (error) {
      console.error(`Error al contar likes del post ${postId}:`, error);
      throw error;
    }
  }
}

export default new LikesRepository();
