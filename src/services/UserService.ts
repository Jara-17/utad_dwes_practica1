import UserRepository from "../repositories/UserRepository";
import User, { IUser } from "../models/User";
import {
  checkPassword,
  checkUserExistence,
  checkUserExistsByEmail,
  checkUserExistsByUsername,
  hashPassword,
} from "../utils/validations.utils";
import { bold } from "colors";
import { generateJWT } from "../utils/jwt.utils";
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from "../errors/exceptions.errors";
import logger from "../utils/logger.util";

class UserService {
  /**
   * Crea un nuevo usuario.
   * @param {Partial<IUser>} userData - Los datos del usuario a crear.
   * @returns {Promise<IUser>} - El usuario creado.
   * @throws {Error} - Si ocurre un error al crear el usuario.
   */
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    try {
      await this.validateUserCreation(user);
      if (user.password) {
        user.password = await hashPassword(user.password);
      }
      return await UserRepository.create(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Inicia sesión de un usuario utilizando su correo electrónico y contraseña.
   * @param {string} email - El correo electrónico del usuario.
   * @param {string} password - La contraseña del usuario.
   * @returns {Promise<string>} - Un token JWT si las credenciales son correctas.
   * @throws {NotFoundException} - Si el usuario no se encuentra.
   * @throws {ConflictException} - Si la contraseña es incorrecta.
   */
  async login(email: string, password: string): Promise<string> {
    const user = await UserRepository.findUserByEmail(email);

    if (!user || user.isDeleted) {
      throw new NotFoundException("Usuario no Encontrado");
    }

    const isPasswordCorrect = await checkPassword(password, user.password);

    if (!isPasswordCorrect) {
      throw new ConflictException("Password o Email Incorrectos");
    }

    return generateJWT({ id: user.id });
  }

  /**
   * Obtiene todos los usuarios.
   * @returns {Promise<IUser[]>} - Una lista de usuarios.
   * @throws {Error} - Si ocurre un error al obtener los usuarios.
   */
  async getUsers(): Promise<IUser[]> {
    try {
      return await UserRepository.findAll();
    } catch (error) {
      throw new InternalServerErrorException(
        "No se pudo obtener la lista de usuarios."
      );
    }
  }

  /**
   * Obtiene un usuario por su ID.
   * @param {string} id - El ID del usuario a obtener.
   * @returns {Promise<IUser | Record<string, never>>} - El usuario encontrado o un objeto vacío.
   * @throws {Error} - Si ocurre un error al obtener el usuario.
   */
  async getUserById(id: string): Promise<IUser | Record<string, never>> {
    try {
      await this.validateUserExist(id);
      return await UserRepository.findById(id);
    } catch (error) {
      console.error("Error al obtener el usuario:", bold.red(error.message));
      throw new InternalServerErrorException("Ha ocurrido un error.");
    }
  }

  /**
   * Actualiza un usuario por su ID.
   * @param {string} id - El ID del usuario a actualizar.
   * @param {Partial<IUser>} userData - Los nuevos datos del usuario.
   * @returns {Promise<IUser | Record<string, never>>} - El usuario actualizado o un objeto vacío.
   * @throws {Error} - Si ocurre un error al actualizar el usuario.
   */
  async updateUser(
    id: string,
    userData: Partial<IUser>
  ): Promise<IUser | Record<string, never>> {
    try {
      await this.validateUserExist(id);
      return await UserRepository.update(id, userData);
    } catch (error) {
      logger.error(
        `Error al actualizar el usuario: ${bold.red(error.message)}`
      );
      throw new InternalServerErrorException(
        "No se pudo actualizar el usuario."
      );
    }
  }

  /**
   * Elimina un usuario por su ID.
   * @param {string} id - El ID del usuario a eliminar.
   * @returns {Promise<void>} - Una promesa que se resuelve cuando el usuario es eliminado.
   * @throws {Error} - Si ocurre un error al eliminar el usuario.
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await this.validateUserExist(id);
      await UserRepository.delete(id);
    } catch (error) {
      logger.error(`Error al eliminar el usuario: ${bold.red(error.message)}`);
      throw new InternalServerErrorException("No se pudo eliminar el usuario.");
    }
  }

  private async validateUserCreation(user: IUser): Promise<void> {
    const userExist = await checkUserExistsByEmail(user.email);
    if (userExist) {
      throw new ConflictException(`El email ya existe, intente con otro.`);
    }

    const usernameExist = await checkUserExistsByUsername(user.username);
    if (usernameExist) {
      throw new ConflictException("El username ya existe, intente con otro.");
    }
  }

  private async validateUserExist(id: string): Promise<void> {
    const userExist = await checkUserExistence(id);
    if (!userExist) {
      throw new NotFoundException("Usuario no Encontrado");
    }
  }
}

export default new UserService();
