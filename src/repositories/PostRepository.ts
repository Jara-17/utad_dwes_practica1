import Post from "../models/Post"; // Asegúrate de que la ruta sea correcta
import { IPost } from "../models/Post"; // Importa la interfaz IPost

class PostRepository {
  /**
   * Crea un nuevo post en la base de datos.
   * @param postData - Los datos del post a crear.
   * @returns Una promesa que se resuelve con el post creado.
   */
  async create(postData: Partial<IPost>): Promise<IPost> {
    const post = new Post(postData);
    return await post.save();
  }

  /**
   * Obtiene todos los posts de la base de datos.
   * @returns Una promesa que se resuelve con un array de posts.
   */
  async findAll(): Promise<IPost[]> {
    return await Post.find().populate({
      path: "user",
      select: "_id username email fullname description",
    });
  }

  /**
   * Busca un post por su ID.
   * @param id - El ID del post a buscar.
   * @returns Una promesa que se resuelve con el post encontrado.
   */
  async findById(id: string): Promise<IPost | null> {
    return await Post.findById(id).populate({
      path: "user",
      select: "_id username email fullname description",
    });
  }

  /**
   * Actualiza un post existente por su ID.
   * @param id - El ID del post a actualizar.
   * @param postData - Los nuevos datos del post.
   * @returns Una promesa que se resuelve con el post actualizado.
   */
  async update(id: string, postData: Partial<IPost>): Promise<IPost | null> {
    return await Post.findByIdAndUpdate(id, postData, { new: true }).populate(
      "user"
    );
  }

  /**
   * Elimina un post por su ID.
   * @param id - El ID del post a eliminar.
   * @returns Una promesa que se resuelve con el post eliminado.
   */
  async delete(id: string): Promise<IPost | null> {
    return await Post.findByIdAndDelete(id);
  }
}

export default new PostRepository();
