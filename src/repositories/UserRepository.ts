import User, { IUser } from "../models/User";

class UserRepository {
  /**
   * Guarda un usuario existente en la base de datos.
   * @param {IUser} user - La instancia del usuario a guardar.
   * @returns {Promise<IUser>} - Una promesa que resuelve al usuario guardado.
   * @throws {Error} - Si ocurre un error al guardar el usuario.
   */
  async save(user: IUser): Promise<IUser> {
    return await user.save();
  }

  /**
   * Crea un nuevo usuario.
   * @param {Partial<IUser>} userData - Datos del usuario a crear.
   * @returns {Promise<IUser>} - Una promesa que resuelve al usuario creado.
   * @throws {Error} - Si ocurre un error al crear el usuario.
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Encuentra todos los usuarios.
   * @returns {Promise<IUser[]>} - Una promesa que resuelve a un array de usuarios.
   * @throws {Error} - Si ocurre un error al obtener los usuarios.
   */
  async findAll(): Promise<IUser[]> {
    return await User.find({ isDeleted: false }).select(
      "-password -createdAt -updatedAt -isDeleted -deletedAt"
    );
  }

  /**
   * Encuentra un usuario por su ID.
   * @param {string} id - ID del usuario a encontrar.
   * @returns {Promise<IUser | null>} - Una promesa que resuelve al usuario encontrado o null si no existe.
   * @throws {Error} - Si ocurre un error al buscar el usuario.
   */
  async findById(id: string): Promise<IUser | null> {
    return await User.findById(this.getActiveQuery({ _id: id })).select(
      "-password -createdAt -updatedAt -isDeleted -deletedAt"
    );
  }

  /**
   * Verifica si un usuario existe por correo electrónico y lo devuelve.
   * @param {string} email - Correo electrónico del usuario.
   * @returns {Promise<IUser | null>} - Una promesa que resuelve al usuario encontrado o null si no existe.
   * @throws {Error} - Si ocurre un error al buscar el usuario.
   */
  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email, isDeleted: false });
  }

  /**
   * Verifica si un usuario existe por nombre de usuario y lo devuelve.
   * @param {string} username - Nombre de usuario del usuario.
   * @returns {Promise<IUser | null>} - Una promesa que resuelve al usuario encontrado o null si no existe.
   * @throws {Error} - Si ocurre un error al buscar el usuario.
   */
  async findUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username, isDeleted: false });
  }

  /**
   * Actualiza un usuario existente.
   * @param {string} id - ID del usuario a actualizar.
   * @param {Partial<IUser>} userData - Datos del usuario a actualizar.
   * @returns {Promise<IUser | null>} - Una promesa que resuelve al usuario actualizado o null si no existe.
   * @throws {Error} - Si ocurre un error al actualizar el usuario.
   */
  async update(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  /**
   * Elimina un usuario por su ID.
   * @param {string} id - ID del usuario a eliminar.
   * @returns {Promise<void>} - Una promesa que se resuelve cuando el usuario es eliminado.
   * @throws {Error} - Si ocurre un error al eliminar el usuario.
   */
  async delete(id: string): Promise<void> {
    await User.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
  }

  /**
   * Genera un objeto de consulta para filtrar registros activos (no eliminados).
   *
   * @param {object} filter - Los criterios de filtro iniciales.
   * @returns {object} Los criterios de filtro modificados, incluyendo la condición para excluir registros eliminados.
   */
  private getActiveQuery(filter: object): object {
    return { ...filter, isDeleted: false };
  }
}

export default new UserRepository();
