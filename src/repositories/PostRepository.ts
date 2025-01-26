import logger from "../utils/logger.util";
import Post, { IPost } from "../models/Post";
import { Types } from "mongoose";
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException
} from "../errors/exceptions.errors";

class PostRepository {
  private readonly fields = "-__v -createdAt -updatedAt";
  private readonly userPopulateOptions = {
    path: "user",
    select: "-password -token -__v -createdAt -updatedAt -isDeleted"
  };

  private readonly likesPopulateOptions = {
    path: "likes",
    select: "_id user",
    populate: {
      path: "user",
      select: "_id username email fullname description"
    }
  };

  /**
   * Crea un nuevo post en la base de datos.
   * @param postData - Los datos del post a crear.
   * @throws BadRequestException si los datos del post son inválidos
   * @throws InternalServerErrorException si hay un error interno del servidor
   * @returns Una promesa que se resuelve con el post creado.
   */
  async create(postData: Omit<IPost, '_id' | 'createdAt' | 'updatedAt'>): Promise<IPost> {
    try {
      const post = new Post(postData);
      await post.save();
      return post;
    } catch (error) {
      if (error instanceof Error && error.name === 'ValidationError') {
        throw new BadRequestException(`Datos del post inválidos: ${error.message}`);
      }
      throw new InternalServerErrorException(`Error al crear el post: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene todos los posts de la base de datos.
   * @throws InternalServerErrorException si hay un error al obtener los posts
   * @returns Una promesa que se resuelve con un array de posts.
   */
  async findAll(): Promise<IPost[]> {
    try {
      return await Post.find()
        .select(this.fields)
        .populate(this.userPopulateOptions)
        .populate(this.likesPopulateOptions)
        .where("user")
        .ne(null)
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new InternalServerErrorException(`Error al obtener los posts: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Busca un post por su ID.
   * @param id - El ID del post a buscar.
   * @throws BadRequestException si el ID es inválido
   * @throws NotFoundException si el post no existe
   * @throws InternalServerErrorException si hay un error interno del servidor
   * @returns Una promesa que se resuelve con el post encontrado.
   */
  async findById(id: string): Promise<IPost> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID de post inválido');
      }

      const post = await Post.findById(id)
        .select(this.fields)
        .populate(this.userPopulateOptions)
        .populate(this.likesPopulateOptions);

      if (!post) {
        throw new NotFoundException(`Post con ID ${id} no encontrado`);
      }

      return post;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error al buscar el post: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualiza un post existente por su ID.
   * @param id - El ID del post a actualizar.
   * @param postData - Los nuevos datos del post.
   * @param userId - El ID del usuario que realiza la actualización.
   * @throws BadRequestException si el ID es inválido o los datos son inválidos
   * @throws NotFoundException si el post no existe
   * @throws InternalServerErrorException si hay un error interno del servidor
   * @returns Una promesa que se resuelve con el post actualizado.
   */
  async update(
    id: string, 
    postData: Partial<Omit<IPost, '_id' | 'user' | 'createdAt' | 'updatedAt'>>,
    userId: string
  ): Promise<IPost> {
    try {
      // Actualizar post
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        postData,
      ).populate(this.userPopulateOptions);

      if (!updatedPost) {
        throw new InternalServerErrorException('No se pudo actualizar el post');
      }

      return updatedPost;
    } catch (error) {
      logger.error('Error en repositorio al actualizar post', {
        postId: id,
        userId,
        error: error.message,
        stack: error.stack
      });

      if (error instanceof BadRequestException || 
          error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error interno al actualizar el post');
    }
  }

  /**
   * Elimina un post por su ID.
   * @param id - El ID del post a eliminar.
   * @throws BadRequestException si el ID es inválido
   * @throws NotFoundException si el post no existe
   * @throws InternalServerErrorException si hay un error interno del servidor
   */
  async delete(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID de post inválido');
      }

      const result = await Post.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Post con ID ${id} no encontrado`);
      }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error al eliminar el post: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}

export default new PostRepository();
