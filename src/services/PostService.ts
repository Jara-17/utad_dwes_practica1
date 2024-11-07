import PostRepository from "../repositories/PostRepository";
import Post, { IPost } from "../models/Post";
import {
  checkPostExistsById,
  checkUserExistence,
} from "../utils/validations.utils";
import { bold } from "colors";
import UserRepository from "../repositories/UserRepository";
import User, { IUser } from "../models/User";
import {
  InternalServerErrorException,
  NotFoundException,
} from "../errors/exceptions.errors";
import { Types } from "mongoose";

class PostService {
  /**
   * Crea un nuevo post.
   * @param postData - Los datos del post a crear.
   * @returns Una promesa que se resuelve con el post creado.
   */
  async createPost(userId: string, postData: Partial<IPost>): Promise<IPost> {
    try {
      const userExist = await checkUserExistence(userId);
      if (!userExist) {
        throw new NotFoundException("Usuario No Encontrado");
      }

      const user = await UserRepository.findById(userId);
      const post: IPost = new Post(postData);
      post.user = user._id as Types.ObjectId;

      return await PostRepository.create(post);
    } catch (error) {
      console.error("Error al crear el post:", bold.red(error.message));
      throw new InternalServerErrorException(
        "Ha ocurrido un error al crear el post"
      );
    }
  }

  /**
   * Obtiene todos los posts.
   * @returns Una promesa que se resuelve con un array de posts.
   */
  async getAllPosts(): Promise<IPost[]> {
    try {
      const posts = await PostRepository.findAll();

      return posts;
    } catch (error) {
      console.error("Error al obtener los posts:", bold.red(error.message));
      throw new InternalServerErrorException(
        "No se pudieron obtener los posts."
      );
    }
  }

  /**
   * Obtiene un post por su ID.
   * @param id - El ID del post a buscar.
   * @returns Una promesa que se resuelve con el post encontrado.
   * @throws Error si el post no se encuentra.
   */
  async getPostById(id: string): Promise<IPost> {
    try {
      await this.validatePostExist(id);

      const post = await PostRepository.findById(id);
      return post;
    } catch (error) {
      console.error("Error al obtener el post:", bold.red(error.message));
      throw new InternalServerErrorException("No se pudo obtener el post.");
    }
  }

  /**
   * Actualiza un post existente.
   * @param id - El ID del post a actualizar.
   * @param postData - Los nuevos datos del post.
   * @returns Una promesa que se resuelve con el post actualizado.
   * @throws Error si el post no se encuentra.
   */
  async updatePost(id: string, postData: Partial<IPost>): Promise<IPost> {
    try {
      await this.validatePostExist(id);

      const post = await PostRepository.update(id, postData);
      return post;
    } catch (error) {
      console.error("Error al actualizar el post:", error);
      throw new InternalServerErrorException("No se pudo actualizar el post.");
    }
  }

  /**
   * Elimina un post por su ID.
   * @param id - El ID del post a eliminar.
   * @returns Una promesa que se resuelve con el post eliminado.
   * @throws Error si el post no se encuentra.
   */
  async deletePost(id: string): Promise<IPost> {
    try {
      await this.validatePostExist(id);

      const post = await PostRepository.delete(id);
      return post;
    } catch (error) {
      console.error("Error al eliminar el post:", bold.red(error.message));
      throw new InternalServerErrorException("No se pudo eliminar el post.");
    }
  }

  private async validatePostExist(id: string) {
    if (!(await checkPostExistsById(id))) {
      throw new NotFoundException("Post No Encontrado");
    }
  }
}

export default new PostService();
