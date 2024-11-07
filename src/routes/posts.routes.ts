import { Router } from "express";
import { PostController } from "../controllers/PostController";
import { authenticate } from "../middlewares/auth.middlewares";

const router: Router = Router();

router.use(authenticate);

router.post("/", PostController.createPost);
router.get("/", PostController.getAllPosts);
router.get("/:id", PostController.getPostById);
router.put("/:id", PostController.updatePost);
router.delete("/:id", PostController.deletePost);

export default router;
