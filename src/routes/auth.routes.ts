import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticate, validateResults } from "../middlewares/auth.middlewares";
import FollowersController from "../controllers/FollowersController";
import {
  createAccountValidation,
  loginValidation,
  updateAccountValidation,
} from "../validators/auth.validator";
import {
  handleMulterError,
  uploadProfilePictureMiddleware,
} from "../middlewares/multer.middleware";
import {
  hasUserAccess,
  hasFollowerAccess,
} from "../middlewares/access.middleware";

const router: Router = Router();

// Rutas públicas de autenticación
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Crea una cuenta de usuario.
 *     description: Crea una cuenta de usuario con los datos proporcionados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               username:
 *                 type: string
 *                 example: user123
 *               description:
 *                 type: string
 *                 example: I'm a user
 *     responses:
 *       200:
 *         description: Usuario creado exitosamente.
 *       409:
 *         description: El email o username ya existe, intente con otro.
 *       500:
 *         description: Error al crear la cuenta.
 */
router.post(
  "/create-account",
  createAccountValidation,
  validateResults,
  AuthController.createAccount
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Inicia sesión.
 *     description: Inicia sesión con el email y la contraseña proporcionados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *       404:
 *         description: Usuario no Encontrado.
 *       409:
 *         description: Password o Email Incorrectos.
 *       500:
 *         description: Error al iniciar sesión.
 */
router.post("/login", loginValidation, validateResults, AuthController.login);

// Middleware de autenticación para rutas protegidas
router.use(authenticate);

// Rutas de usuarios
/**
 * @openapi
 * /api/auth/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtiene todos los usuarios.
 *     description: Obtiene una lista de todos los usuarios registrados.
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente.
 *       500:
 *         description: Error al obtener los usuarios.
 */
router.get("/users", AuthController.getAllUsers);


/**
 * @openapi
 * /api/auth/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtiene un usuario por ID.
 *     description: Obtiene los datos de un usuario por su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error al obtener el usuario.
 */
router.get("/users/:id", AuthController.getUserById);

/**
 * @openapi
 * /api/auth/users:
 *   put:
 *     tags:
 *       - Users
 *     summary: Actualiza el perfil del usuario autenticado.
 *     description: Actualiza los datos del perfil del usuario que ha iniciado sesión.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error al actualizar el perfil.
 */
router.put(
  "/users",
  hasUserAccess,
  updateAccountValidation,
  validateResults,
  AuthController.updateUser
);

/**
 * @openapi
 * /api/auth/users/profile-picture:
 *   post:
 *     tags:
 *       - Users
 *     summary: Actualiza la foto de perfil del usuario autenticado.
 *     description: Sube o actualiza la foto de perfil del usuario que ha iniciado sesión.
 *     responses:
 *       200:
 *         description: Foto de perfil actualizada exitosamente.
 *       400:
 *         description: Error en el archivo subido.
 *       500:
 *         description: Error al actualizar la foto de perfil.
 */
router.post(
  "/users/profile-picture",
  hasUserAccess,
  uploadProfilePictureMiddleware,
  handleMulterError,
  AuthController.uploadProfilePicture
);

/**
 * @openapi
 * /api/auth/users:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Elimina la cuenta del usuario autenticado.
 *     description: Elimina la cuenta del usuario que ha iniciado sesión.
 *     responses:
 *       200:
 *         description: Cuenta eliminada exitosamente.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error al eliminar la cuenta.
 */
router.delete("/users", hasUserAccess, AuthController.deleteUser);

// Rutas de seguidores
/**
 * @openapi
 * /api/auth/users/{id}/followers:
 *   get:
 *     tags:
 *       - Followers
 *     summary: Obtiene los seguidores de un usuario.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de seguidores obtenida exitosamente.
 */
router.get("/users/:id/followers", FollowersController.getFollowers);

/**
 * @openapi
 * /api/auth/users/{id}/following:
 *   get:
 *     tags:
 *       - Followers
 *     summary: Obtiene los usuarios seguidos.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de usuarios seguidos obtenida exitosamente.
 */
router.get("/users/:id/following", FollowersController.getFollowing);

/**
 * @openapi
 * /api/auth/followers/{followerId}:
 *   post:
 *     tags:
 *       - Followers
 *     summary: Sigue a un usuario.
 *     parameters:
 *       - in: path
 *         name: followerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Seguidor añadido exitosamente.
 */
router.post(
  "/followers/:followingId",
  hasFollowerAccess,
  FollowersController.createFollower
);

/**
 * @openapi
 * /api/auth/followers/{followerId}:
 *   delete:
 *     tags:
 *       - Followers
 *     summary: Deja de seguir a un usuario.
 *     parameters:
 *       - in: path
 *         name: followerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seguidor eliminado exitosamente.
 */
router.delete(
  "/followers/:followingId",
  hasFollowerAccess,
  FollowersController.deleteFollower
);

export default router;
