import PostRepository from "../repositories/PostRepository";
import Post, { IPost } from "../models/Post";
import UserRepository from "../repositories/UserRepository";
import mongoose, { Types } from "mongoose";
import {
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException
} from "../errors/exceptions.errors";
import logger from "../utils/logger.util";

interface CreatePostData {
  header: string;
  content: string;
  image?: string;
}

interface UpdatePostData {
  header?: string;
  content?: string;
  image?: string;
}

class PostService {
  /**
   * Crea un nuevo post.
   * @param userId - ID del usuario que crea el post
   * @param postData - Los datos del post a crear
   * @throws BadRequestException si los datos del post son inválidos
   * @throws NotFoundException si el usuario no existe
   * @throws InternalServerErrorException si hay un error interno
   * @returns El post creado
   */
  async createPost(userId: string, postData: CreatePostData): Promise<IPost> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('ID de usuario inválido');
      }

      if (!postData.header?.trim() || !postData.content?.trim()) {
        throw new BadRequestException('El título y el contenido son obligatorios');
      }

      const user = await UserRepository.findById(userId, {
        visibility: "private",
        includeDeleted: false
      });
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }

      const post = new Post({
        header: postData.header,
        content: postData.content,
        image: postData.image,
        user: user._id
      });

      const createdPost = await PostRepository.create(post);
      
      // Actualizar la referencia en el usuario
      user.posts.push(createdPost._id as Types.ObjectId);
      await user.save();

      return createdPost;
    } catch (error) {
      logger.error("Error al crear el post", { error: error.message });
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Error interno al crear el post");
    }
  }

  /**
   * Obtiene todos los posts.
   * @throws InternalServerErrorException si hay un error al obtener los posts
   * @returns Array de posts
   */
  async getAllPosts(): Promise<IPost[]> {
    try {
      return await PostRepository.findAll();
    } catch (error) {
      logger.error("Error al obtener los posts", { error: error.message });
      throw new InternalServerErrorException("Error al obtener los posts");
    }
  }

  /**
   * Obtiene un post por su ID.
   * @param id - ID del post a buscar
   * @throws BadRequestException si el ID no es válido
   * @throws NotFoundException si el post no existe
   * @throws InternalServerErrorException si hay un error interno
   * @returns El post encontrado
   */
  async getPostById(id: string): Promise<IPost> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID de post inválido');
      }

      return await PostRepository.findById(id);
    } catch (error) {
      logger.error("Error al obtener el post", { error: error.message });
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Error al obtener el post");
    }
  }

  /**
   * Actualiza un post existente.
   * @param id - ID del post a actualizar
   * @param userId - ID del usuario que intenta actualizar el post
   * @param postData - Datos a actualizar del post
   * @throws BadRequestException si los datos o IDs son inválidos
   * @throws NotFoundException si el post no existe
   * @throws ConflictException si el usuario no es el propietario del post
   * @throws InternalServerErrorException si hay un error interno
   * @returns El post actualizado
   */
  async updatePost(id: string, userId: string, postData: UpdatePostData): Promise<IPost> {
    try {
      if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('IDs inválidos');
      }

      const post = await PostRepository.findById(id);
      
      // Verificar propiedad del post
      if (post.user._id.toString() !== userId) {
        throw new ConflictException('No tienes permiso para modificar este post');
      }

      // Validar datos de actualización
      if (postData.header?.trim() === '' || postData.content?.trim() === '') {
        throw new BadRequestException('El título y el contenido no pueden estar vacíos');
      }

      return await PostRepository.update(id, postData);
    } catch (error) {
      logger.error("Error al actualizar el post", { error: error.message });
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException ||
          error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException("Error al actualizar el post");
    }
  }

  /**
   * Elimina un post.
   * @param id - ID del post a eliminar
   * @param userId - ID del usuario que intenta eliminar el post
   * @throws BadRequestException si los IDs son inválidos
   * @throws NotFoundException si el post no existe
   * @throws ConflictException si el usuario no es el propietario del post
   * @throws InternalServerErrorException si hay un error interno
   */
  async deletePost(id: string, userId: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('IDs inválidos');
      }

      const post = await PostRepository.findById(id);
      
      // Verificar propiedad del post
      if (post.user._id.toString() !== userId) {
        throw new ConflictException('No tienes permiso para eliminar este post');
      }

      await PostRepository.delete(id);

      // Eliminar la referencia del post en el usuario
      const user = await UserRepository.findById(userId, {
        visibility: "private",
        includeDeleted: false
      });
      if (user) {
        user.posts = user.posts.filter(postId => postId.toString() !== id);
        await user.save();
      }
    } catch (error) {
      logger.error("Error al eliminar el post", { error: error.message });
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException ||
          error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException("Error al eliminar el post");
    }
  }
}

export default new PostService();
