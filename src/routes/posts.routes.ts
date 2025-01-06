import { Router } from "express";
import { PostController } from "../controllers/PostController";
import { authenticate } from "../middlewares/auth.middlewares";
import LikesController from "../controllers/LikesController";

const router: Router = Router();

router.use(authenticate);

router.post("/", PostController.createPost);
router.get("/", PostController.getAllPosts);
router.get("/:postId", PostController.getPostById);
router.put("/:postId", PostController.updatePost);
router.delete("/:postId", PostController.deletePost);

// Rutas de Likes
router.post("/:postId/likes", LikesController.createLike);
router.get("/:postId/likes", LikesController.getAllLikes);
router.get("/:postId/likes/:likeId", LikesController.getLikeById);
router.delete("/:postId/likes/:likeId", LikesController.deleteLike);

export default router;
