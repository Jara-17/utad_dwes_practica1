import { Types } from "mongoose";
import bcrypt from "bcrypt";
import { BadRequestException } from "../errors/exceptions.errors";
import PostRepository from "../repositories/PostRepository";
import UserRepository, { UserQueryOptions } from "../repositories/UserRepository";
import LikesRepository from "../repositories/LikesRepository";
import logger from "./logger.util";

/**
 * Opciones para la validación de contraseñas
 */
export interface PasswordValidationOptions {
  minLength?: number;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
}

const DEFAULT_PASSWORD_OPTIONS: PasswordValidationOptions = {
  minLength: 8,
  requireNumbers: true,
  requireSpecialChars: true,
  requireUppercase: true,
  requireLowercase: true,
};

/**
 * Valida un ObjectId de MongoDB
 * @param id - ID a validar
 * @throws {BadRequestException} Si el ID no es válido
 */
export const validateObjectId = (id: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`ID inválido: ${id}`);
  }
};

/**
 * Valida un email
 * @param email - Email a validar
 * @returns true si el email es válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida un nombre de usuario
 * @param username - Username a validar
 * @returns true si el username es válido
 */
export const isValidUsername = (username: string): boolean => {
  // Permite letras, números, guiones y guiones bajos, 3-30 caracteres
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Valida una contraseña según las opciones especificadas
 * @param password - Contraseña a validar
 * @param options - Opciones de validación
 * @throws {BadRequestException} Si la contraseña no cumple los requisitos
 */
export const validatePassword = (
  password: string,
  options: PasswordValidationOptions = DEFAULT_PASSWORD_OPTIONS
): void => {
  const errors: string[] = [];

  if (options.minLength && password.length < options.minLength) {
    errors.push(`La contraseña debe tener al menos ${options.minLength} caracteres`);
  }

  if (options.requireNumbers && !/\d/.test(password)) {
    errors.push("La contraseña debe contener al menos un número");
  }

  if (options.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("La contraseña debe contener al menos un carácter especial");
  }

  if (options.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra mayúscula");
  }

  if (options.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra minúscula");
  }

  if (errors.length > 0) {
    throw new BadRequestException(errors.join(". "));
  }
};

/**
 * Hashea una contraseña utilizando bcrypt
 * @param password - Contraseña a hashear
 * @returns Contraseña hasheada
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Verifica si una contraseña coincide con su hash
 * @param enteredPassword - Contraseña ingresada
 * @param storedHash - Hash almacenado
 * @returns true si las contraseñas coinciden
 */
export const checkPassword = async (
  enteredPassword: string,
  storedHash: string
): Promise<boolean> => {
  return await bcrypt.compare(enteredPassword, storedHash);
};

/**
 * Sanitiza y valida una URL
 * @param url - URL a validar
 * @returns URL sanitizada
 * @throws {BadRequestException} Si la URL no es válida
 */
export const validateAndSanitizeUrl = (url: string): string => {
  try {
    const sanitizedUrl = new URL(url).toString();
    return sanitizedUrl;
  } catch {
    throw new BadRequestException("URL inválida");
  }
};

/**
 * Valida un archivo según su tipo MIME y tamaño
 * @param file - Archivo a validar
 * @param allowedTypes - Tipos MIME permitidos
 * @param maxSize - Tamaño máximo en bytes
 * @throws {BadRequestException} Si el archivo no cumple los requisitos
 */
export const validateFile = (
  file: Express.Multer.File,
  allowedTypes: string[],
  maxSize: number
): void => {
  if (!file) {
    throw new BadRequestException("No se ha proporcionado ningún archivo");
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(", ")}`
    );
  }

  if (file.size > maxSize) {
    throw new BadRequestException(
      `El archivo es demasiado grande. Tamaño máximo: ${maxSize / 1024 / 1024}MB`
    );
  }
};

/**
 * Verifica si un usuario existe por ID.
 * @param id - ID del usuario
 * @returns true si el usuario existe, false si no
 */
export const checkUserExistence = async (id: string): Promise<boolean> => {
  validateObjectId(id);

  const userOptions: UserQueryOptions = { visibility: "private", includeDeleted: false };

  return !!(await UserRepository.findById(id, userOptions));
};

/**
 * Verifica si un usuario existe por correo electrónico.
 * @param email - Correo electrónico del usuario
 * @returns true si el usuario existe, false si no
 */
export const checkUserExistsByEmail = async (
  email: string
): Promise<boolean> => {
  if (!isValidEmail(email)) {
    throw new BadRequestException("Correo electrónico inválido");
  }
  return !!(await UserRepository.findUserByEmail(email));
};

/**
 * Verifica si un usuario existe por nombre de usuario.
 * @param username - Nombre de usuario del usuario
 * @returns true si el usuario ya existe, false si no
 */
export const checkUserExistsByUsername = async (
  username: string
): Promise<boolean> => {
  if (!isValidUsername(username)) {
    throw new BadRequestException("Nombre de usuario inválido");
  }
  return !!(await UserRepository.findUserByUsername(username));
};

/**
 * Verifica si un post existe por su ID.
 * @param id - El ID del post a verificar.
 * @returns true si el post existe, false si no.
 */
export const checkPostExistsById = async (id: string): Promise<boolean> => {
  validateObjectId(id);
  return Types.ObjectId.isValid(id) && !!(await PostRepository.findById(id));
};

/**
 * Verifica si un like existe por su ID.
 * @param {string} id - ID del like a verificar.
 * @returns {Promise<boolean>} - Una promesa que resuelve a true si el like existe, false si no.
 * @throws {Error} - Si ocurre un error al buscar el like.
 */
export const checkLikeExistById = async (id: string): Promise<boolean> => {
  const ObjectId = new Types.ObjectId(id);

  validateObjectId(id);
  return !!(await LikesRepository.findById(ObjectId));
};
