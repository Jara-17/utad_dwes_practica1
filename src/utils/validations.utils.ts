import { Types } from "mongoose";
import bcrypt from "bcrypt";
import PostRepository from "../repositories/PostRepository";
import UserRepository from "../repositories/UserRepository";
import LikesRepository from "../repositories/LikesRepository";

/**
 * Verifica si un usuario existe por ID.
 * @param id - ID del usuario
 * @returns true si el usuario existe, false si no
 */
export const checkUserExistence = async (id: string): Promise<boolean> => {
  return !!(await UserRepository.findById(id));
};

/**
 * Verifica si un usuario existe por correo electrónico.
 * @param email - Correo electrónico del usuario
 * @returns true si el usuario existe, false si no
 */
export const checkUserExistsByEmail = async (
  email: string
): Promise<boolean> => {
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
  return !!(await UserRepository.findUserByUsername(username));
};

/**
 * Verifica si un post existe por su ID.
 * @param id - El ID del post a verificar.
 * @returns true si el post existe, false si no.
 */
export const checkPostExistsById = async (id: string): Promise<boolean> => {
  return Types.ObjectId.isValid(id) && !!(await PostRepository.findById(id));
};

/**
 * Hashea una contraseña utilizando bcrypt.
 * @param password - La contraseña a hashear
 * @returns La contraseña hasheada
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Verifica si una contraseña ingresada coincide con el hash almacenado.
 * @param enteredPassword - La contraseña ingresada por el usuario
 * @param storedHash - El hash de la contraseña almacenada
 * @returns true si las contraseñas coinciden, false si no
 */
export const checkPassword = async (
  enteredPassword: string,
  storedHash: string
): Promise<boolean> => {
  return await bcrypt.compare(enteredPassword, storedHash);
};

/**
 * Verifica si un like existe por su ID.
 * @param {string} id - ID del like a verificar.
 * @returns {Promise<boolean>} - Una promesa que resuelve a true si el like existe, false si no.
 * @throws {Error} - Si ocurre un error al buscar el like.
 */
export const checkLikeExistById = async (id: string): Promise<boolean> => {
  return !!(await LikesRepository.findById(id));
};
