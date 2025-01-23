import User, { IUser } from "../models/User";
import { Types } from "mongoose";

type Visibility = "public" | "private" | "admin";

export interface UserQueryOptions {
  includeDeleted?: boolean;
  visibility: Visibility;
}

class UserRepository {
  private readonly publicFields = "-isDeleted -deletedAt -updatedAt -createdAt -password -token -__v -originalEmail -originalUsername";
  private readonly privateFields = "-password -token -__v";
  private readonly defaultPopulate = [
    {
      path: "posts",
      select: "_id header content -user",
    }
  ];

  /**
   * Obtiene los campos a seleccionar según el nivel de visibilidad
   * @param {Visibility} visibility - Nivel de visibilidad
   * @returns {string | null} - Campos a seleccionar o null
   * 
   * @example
   * getFieldsByVisibility("public") // "-isDeleted -deletedAt -updatedAt -createdAt -password -token -__v -originalEmail -originalUsername"
   * getFieldsByVisibility("private") // "-password -token -__v"
   * getFieldsByVisibility("admin") // null
   */
  private getFieldsByVisibility(visibility: Visibility): string | null {
    switch (visibility) {
      case "public":
        return this.publicFields;
      case "private":
        return this.privateFields;
      case "admin":
        return null; // Retorna todos los campos
      default:
        return this.publicFields;
    }
  }

  /**
   * Guarda un usuario existente en la base de datos.
   * @param {IUser} user - La instancia del usuario a guardar.
   * @returns {Promise<IUser>} - Una promesa que resuelve al usuario guardado.
   */
  async save(user: IUser): Promise<IUser> {
    return await user.save();
  }

  /**
   * Crea un nuevo usuario.
   * @param {Partial<IUser>} userData - Datos del usuario a crear.
   * @returns {Promise<IUser>} - Una promesa que resuelve al usuario creado.
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Obtiene una lista de usuarios según las opciones especificadas.
   * @param {UserQueryOptions} options - Opciones de consulta
   * @returns {Promise<IUser[]>} - Lista de usuarios según los criterios especificados
   */
  async findAll(options: UserQueryOptions): Promise<IUser[]> {
    const query = options.includeDeleted ? {} : { isDeleted: false };
    const fields = this.getFieldsByVisibility(options.visibility);

    const baseQuery = User.find(query);
    
    if (fields) {
      baseQuery.select(fields);
    }

    return await baseQuery.populate(this.defaultPopulate);
  }

  /**
   * Busca un usuario por su ID con las opciones especificadas.
   * @param {string} id - ID del usuario
   * @param {UserQueryOptions} options - Opciones de consulta
   * @returns {Promise<IUser | null>} - Usuario encontrado o null
   */
  async findById(id: string, options: UserQueryOptions): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const query = options.includeDeleted ? { _id: id } : { _id: id, isDeleted: false };
    const fields = this.getFieldsByVisibility(options.visibility);

    const baseQuery = User.findOne(query);
    
    if (fields) {
      baseQuery.select(fields);
    }

    return await baseQuery.populate(this.defaultPopulate);
  }

  /**
   * Busca un usuario por email, considerando solo usuarios activos.
   * @param {string} email - Email del usuario
   * @returns {Promise<IUser | null>} - Usuario encontrado o null
   */
  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email, isDeleted: false });
  }

  /**
   * Busca un usuario por username, considerando solo usuarios activos.
   * @param {string} username - Username del usuario
   * @returns {Promise<IUser | null>} - Usuario encontrado o null
   */
  async findUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username, isDeleted: false });
  }

  /**
   * Actualiza un usuario existente.
   * @param {string} id - ID del usuario
   * @param {Partial<IUser>} userData - Datos a actualizar
   * @returns {Promise<IUser | null>} - Usuario actualizado o null
   */
  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: userData },
      { new: true }
    ).populate(this.defaultPopulate);
  }

  /**
   * Realiza el borrado lógico de un usuario.
   * @param {string} id - ID del usuario
   * @returns {Promise<IUser | null>} - Usuario eliminado o null
   */
  async delete(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
      return null;
    }

    user.isDeleted = true;
    return await user.save();
  }

  /**
   * Restaura un usuario previamente eliminado.
   * @param {string} id - ID del usuario
   * @returns {Promise<IUser | null>} - Usuario restaurado o null
   */
  async restore(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const user = await User.findOne({ _id: id, isDeleted: true });
    if (!user) {
      return null;
    }

    // Verificar si el email y username originales están disponibles
    const [emailExists, usernameExists] = await Promise.all([
      User.exists({ email: user.originalEmail, isDeleted: false }),
      User.exists({ username: user.originalUsername, isDeleted: false })
    ]);

    if (emailExists || usernameExists) {
      throw new Error("No se puede restaurar el usuario porque el email o username ya están en uso");
    }

    user.isDeleted = false;
    user.deletedAt = undefined;
    user.email = user.originalEmail!;
    user.username = user.originalUsername!;
    user.originalEmail = undefined;
    user.originalUsername = undefined;

    return await user.save();
  }

  /**
   * Cuenta el número de usuarios según los criterios especificados.
   * @param {boolean} includeDeleted - Si se deben incluir usuarios eliminados
   * @returns {Promise<number>} - Número de usuarios
   */
  async count(includeDeleted: boolean = false): Promise<number> {
    const query = includeDeleted ? {} : { isDeleted: false };
    return await User.countDocuments(query);
  }
}

export default new UserRepository();
