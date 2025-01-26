import { Router } from "express";
import { PostController } from "../controllers/PostController";
import { authenticate, validateResults } from "../middlewares/auth.middlewares";
import LikesController from "../controllers/LikesController";
import {
  hasAccess,
  validatePostExists,
  validatePostId,
} from "../middlewares/post.middlewares";
import { PostValidation } from "../validators/post.validator";
import {
  validateLikeExists,
  validateLikeId,
} from "../middlewares/likes.midlewares";

const router: Router = Router();

router.use(authenticate);
router.param("postId", validatePostId);
router.param("postId", validatePostExists);

router.param("likeId", validateLikeId);
router.param("likeId", validateLikeExists);

/**
 * @openapi
 * /api/posts:
 *   post:
 *     tags:
 *       - Posts
 *     summary: Crea un nuevo post.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Datos inválidos.
 *       500:
 *         description: Error al crear el post.
 */
router.post("/", PostValidation, validateResults, PostController.createPost);

/**
 * @openapi
 * /api/posts:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Obtiene todos los posts.
 *     responses:
 *       200:
 *         description: Lista de posts obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Error al obtener los posts.
 */
router.get("/", PostController.getAllPosts);

/**
 * @openapi
 * /api/posts/{postId}:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Obtiene un post por ID.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del post.
 *     responses:
 *       200:
 *         description: Post obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post no encontrado.
 *       500:
 *         description: Error al obtener el post.
 */
router.get("/:postId", PostController.getPostById);

/**
 * @openapi
 * /api/posts/{postId}:
 *   put:
 *     tags:
 *       - Posts
 *     summary: Actualiza un post por ID.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del post.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post no encontrado.
 *       500:
 *         description: Error al actualizar el post.
 */
router.put(
  "/:postId",
  hasAccess,
  PostValidation,
  validateResults,
  PostController.updatePost
);

/**
 * @openapi
 * /api/posts/{postId}:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: Elimina un post por ID.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del post.
 *     responses:
 *       200:
 *         description: Post eliminado exitosamente.
 *       404:
 *         description: Post no encontrado.
 *       500:
 *         description: Error al eliminar el post.
 */
router.delete("/:postId", hasAccess, PostController.deletePost);

/**
 * @openapi
 * /api/posts/{postId}/likes:
 *   post:
 *     tags:
 *       - Likes
 *     summary: Crea un like para un post.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del post.
 *     responses:
 *       201:
 *         description: Like creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Like'
 *       404:
 *         description: Post no encontrado.
 *       500:
 *         description: Error al crear el like.
 */
router.post("/:postId/likes", LikesController.createLike);

/**
 * @openapi
 * /api/posts/{postId}/likes:
 *   get:
 *     tags:
 *       - Likes
 *     summary: Obtiene todos los likes de un post.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del post.
 *     responses:
 *       200:
 *         description: Likes obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Like'
 *       404:
 *         description: Post no encontrado.
 *       500:
 *         description: Error al obtener los likes.
 */
router.get("/:postId/likes", LikesController.getAllLikes);

/**
 * @openapi
 * /api/posts/{postId}/likes/{likeId}:
 *   get:
 *     tags:
 *       - Likes
 *     summary: Obtiene un like por ID.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del post.
 *       - in: path
 *         name: likeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del like.
 *     responses:
 *       200:
 *         description: Like obtenido exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Like'
 *       404:
 *         description: Like no encontrado.
 *       500:
 *         description: Error al obtener el like.
 */
router.get("/:postId/likes/:likeId", LikesController.getLikeById);

/**
 * @openapi
 * /api/posts/{postId}/likes/{likeId}:
 *   delete:
 *     tags:
 *       - Likes
 *     summary: Elimina un like por ID.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del post.
 *       - in: path
 *         name: likeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del like.
 *     responses:
 *       200:
 *         description: Like eliminado exitosamente.
 *       404:
 *         description: Like no encontrado.
 *       500:
 *         description: Error al eliminar el like.
 */
router.delete("/:postId/likes/:likeId", LikesController.deleteLike);

export default router;
