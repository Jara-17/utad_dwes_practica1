import { existsSync, unlink } from "node:fs";
import { join } from "node:path";
import UserRepository from "../repositories/UserRepository";
import { IUser } from "../models/User";
import {
  checkPassword,
  hashPassword,
} from "../utils/validations.utils";
import { generateJWT } from "../utils/jwt.utils";
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "../errors/exceptions.errors";
import logger from "../utils/logger.util";
import Post from "../models/Post";

interface UserResponse {
  user: IUser;
  token?: string;
}

class UserService {
  /**
   * Crea un nuevo usuario y genera su token JWT.
   * @param {Partial<IUser>} userData - Datos del usuario a crear
   * @returns {Promise<UserResponse>} Usuario creado y su token
   */
  async createUser(userData: Partial<IUser>): Promise<UserResponse> {
    try {
      logger.info("Iniciando creación de usuario", {
        email: userData.email,
        username: userData.username
      });

      // Validar datos únicos
      await this.validateUniqueFields(userData.email, userData.username);
      logger.debug("Campos únicos validados correctamente");

      // Crear usuario con contraseña hasheada
      const hashedPassword = userData.password ? await hashPassword(userData.password) : undefined;
      const user = await UserRepository.create({
        ...userData,
        password: hashedPassword,
      });

      logger.debug("Usuario creado en base de datos", { userId: user.id });

      // Generar token
      const token = generateJWT({ id: user.id });
      logger.info("Usuario creado exitosamente", { userId: user.id });

      return { user, token };
    } catch (error) {
      if (error instanceof ConflictException) {
        logger.warn("Intento de crear usuario con datos duplicados", {
          email: userData.email,
          username: userData.username,
          error: error.message
        });
        throw error;
      }
      logger.error("Error al crear usuario", {
        error: error.message,
        stack: error.stack,
        userData: {
          email: userData.email,
          username: userData.username
        }
      });
      throw new InternalServerErrorException("No se pudo crear el usuario");
    }
  }

  /**
   * Inicia sesión y genera token JWT.
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<UserResponse>} Usuario y su token
   */
  async login(email: string, password: string): Promise<string> {
    try {
      logger.info("Intento de inicio de sesión", { email });

      const user = await UserRepository.findUserByEmail(email);
      if (!user) {
        logger.warn("Intento de inicio de sesión con email no registrado", { email });
        throw new UnauthorizedException("Credenciales inválidas");
      }

      const isPasswordValid = await checkPassword(password, user.password);
      if (!isPasswordValid) {
        logger.warn("Intento de inicio de sesión con contraseña incorrecta", { email });
        throw new UnauthorizedException("Credenciales inválidas");
      }

      const token = generateJWT({ id: user.id });
      logger.info("Inicio de sesión exitoso", { userId: user.id, email });

      return token;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      logger.error("Error en el proceso de login", {
        error: error.message,
        stack: error.stack,
        email
      });
      throw new InternalServerErrorException("Error en el proceso de inicio de sesión");
    }
  }

  /**
   * Obtiene todos los usuarios activos.
   * @param {boolean} includeDeleted - Si se incluyen usuarios eliminados
   * @returns {Promise<IUser[]>} Lista de usuarios
   */
  async getUsers(includeDeleted: boolean = false): Promise<IUser[]> {
    try {
      logger.info("Obteniendo lista de usuarios", { includeDeleted });
      
      const users = await UserRepository.findAll({
        includeDeleted,
        visibility: "public"
      });

      logger.info("Lista de usuarios obtenida", { count: users.length });
      return users;
    } catch (error) {
      logger.error("Error al obtener usuarios", {
        error: error.message,
        stack: error.stack,
        includeDeleted
      });
      throw new InternalServerErrorException("No se pudieron obtener los usuarios");
    }
  }

  /**
   * Obtiene un usuario por su ID.
   * @param {string} id - ID del usuario
   * @param {boolean} isAdmin - Si el solicitante es admin
   * @returns {Promise<IUser>} Usuario encontrado
   */
  async getUserById(id: string, isAdmin: boolean = false): Promise<IUser> {
    try {
      logger.info("Buscando usuario por ID", { userId: id, isAdmin });

      const user = await UserRepository.findById(id, {
        visibility: isAdmin ? "admin" : "public",
        includeDeleted: isAdmin
      });

      if (!user) {
        logger.warn("Usuario no encontrado", { userId: id });
        throw new NotFoundException("Usuario no encontrado");
      }

      logger.info("Usuario encontrado", { userId: id });
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logger.error("Error al buscar usuario por ID", {
        error: error.message,
        stack: error.stack,
        userId: id
      });
      throw new InternalServerErrorException("Error al buscar el usuario");
    }
  }

  /**
   * Actualiza un usuario existente.
   * @param {string} id - ID del usuario
   * @param {Partial<IUser>} userData - Datos a actualizar
   * @returns {Promise<IUser>} Usuario actualizado
   */
  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser> {
    try {
      logger.info("Iniciando actualización de usuario", {
        userId: id,
        updateFields: Object.keys(userData)
      });

      // Si se intenta actualizar email o username, validar que sean únicos
      if (userData.email || userData.username) {
        await this.validateUniqueFields(userData.email, userData.username, id);
        logger.debug("Campos únicos validados correctamente");
      }

      // Si se actualiza la contraseña, hashearla
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
        logger.debug("Contraseña hasheada correctamente");
      }

      const updatedUser = await UserRepository.update(id, userData);
      if (!updatedUser) {
        logger.warn("Intento de actualizar usuario no existente", { userId: id });
        throw new NotFoundException("Usuario no encontrado");
      }

      logger.info("Usuario actualizado exitosamente", { 
        userId: id,
        updatedFields: Object.keys(userData)
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      logger.error("Error al actualizar usuario", {
        error: error.message,
        stack: error.stack,
        userId: id,
        updateFields: Object.keys(userData)
      });
      throw new InternalServerErrorException("No se pudo actualizar el usuario");
    }
  }

  /**
   * Elimina lógicamente un usuario y sus posts.
   * @param {string} id - ID del usuario
   */
  async deleteUser(id: string): Promise<void> {
    try {
      logger.info("Iniciando proceso de eliminación de usuario", { userId: id });

      const user = await UserRepository.findById(id, {
        visibility: "admin",
        includeDeleted: false
      });

      if (!user) {
        logger.warn("Intento de eliminar usuario no existente", { userId: id });
        throw new NotFoundException("Usuario no encontrado");
      }

      // Eliminar físicamente los posts del usuario
      const postsResult = await Post.deleteMany({ user: user._id });
      logger.info("Posts del usuario eliminados físicamente", {
        userId: id,
        postsDeleted: postsResult.deletedCount
      });

      // Eliminar usuario
      await UserRepository.delete(id);
      logger.info("Usuario eliminado exitosamente", { userId: id });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      logger.error("Error al eliminar usuario", {
        error: error.message,
        stack: error.stack,
        userId: id
      });
      throw new InternalServerErrorException("No se pudo eliminar el usuario");
    }
  }

  /**
   * Restaura un usuario previamente eliminado.
   * @param {string} id - ID del usuario
   * @returns {Promise<IUser>} Usuario restaurado
   */
  async restoreUser(id: string): Promise<IUser> {
    try {
      logger.info("Iniciando restauración de usuario", { userId: id });

      const restoredUser = await UserRepository.restore(id);
      if (!restoredUser) {
        logger.warn("Intento de restaurar usuario no existente", { userId: id });
        throw new NotFoundException("Usuario no encontrado");
      }

      // Restaurar posts del usuario
      const postsResult = await Post.updateMany(
        { user: restoredUser._id },
        { $set: { isDeleted: false, deletedAt: null } }
      );
      logger.info("Posts del usuario restaurados", {
        userId: id,
        postsAffected: postsResult.modifiedCount
      });

      logger.info("Usuario restaurado exitosamente", { userId: id });
      return restoredUser;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      logger.error("Error al restaurar usuario", {
        error: error.message,
        stack: error.stack,
        userId: id
      });
      throw new InternalServerErrorException("No se pudo restaurar el usuario");
    }
  }

  /**
   * Actualiza la foto de perfil de un usuario.
   * @param {Express.Multer.File} profilePicture - Nueva imagen de perfil
   * @param {string} userId - ID del usuario
   */
  async uploadProfilePicture(
    profilePicture: Express.Multer.File,
    userId: string
  ): Promise<void> {
    try {
      logger.info("Iniciando actualización de foto de perfil", {
        userId,
        fileName: profilePicture?.filename,
        fileSize: profilePicture?.size
      });

      if (!profilePicture) {
        logger.warn("Intento de actualizar foto de perfil sin imagen", { userId });
        throw new BadRequestException("No se ha proporcionado una imagen");
      }

      const user = await this.getUserById(userId, true);

      // Eliminar imagen anterior si existe
      if (user.profilePicture) {
        const oldImagePath = join(__dirname, "..", "uploads", user.profilePicture);
        if (existsSync(oldImagePath)) {
          await new Promise<void>((resolve, reject) => {
            unlink(oldImagePath, (err) => {
              if (err) reject(err);
              resolve();
            });
          });
          logger.info("Imagen anterior eliminada", {
            userId,
            oldImagePath: user.profilePicture
          });
        }
      }

      // Actualizar usuario con nueva imagen
      await UserRepository.update(userId, {
        profilePicture: profilePicture.filename
      });

      logger.info("Foto de perfil actualizada exitosamente", {
        userId,
        newImagePath: profilePicture.filename
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      logger.error("Error al actualizar foto de perfil", {
        error: error.message,
        stack: error.stack,
        userId,
        fileName: profilePicture?.filename
      });
      throw new InternalServerErrorException("No se pudo actualizar la imagen de perfil");
    }
  }

  /**
   * Valida que el email y username sean únicos.
   * @param {string} email - Email a validar
   * @param {string} username - Username a validar
   * @param {string} excludeUserId - ID de usuario a excluir de la validación
   */
  private async validateUniqueFields(
    email?: string,
    username?: string,
    excludeUserId?: string
  ): Promise<void> {
    logger.debug("Validando campos únicos", {
      email,
      username,
      excludeUserId
    });

    if (email) {
      const existingUser = await UserRepository.findUserByEmail(email);
      if (existingUser && existingUser.id !== excludeUserId) {
        logger.warn("Intento de usar email duplicado", {
          email,
          existingUserId: existingUser.id
        });
        throw new ConflictException("El email ya está en uso");
      }
    }

    if (username) {
      const existingUser = await UserRepository.findUserByUsername(username);
      if (existingUser && existingUser.id !== excludeUserId) {
        logger.warn("Intento de usar nombre de usuario duplicado", {
          username,
          existingUserId: existingUser.id
        });
        throw new ConflictException("El nombre de usuario ya está en uso");
      }
    }

    logger.debug("Validación de campos únicos completada exitosamente");
  }
}

export default new UserService();
