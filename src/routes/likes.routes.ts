import { Router } from "express";
import LikesController from "../controllers/LikesController";
import { authenticate } from "../middlewares/auth.middlewares";

const router = Router();
router.use(authenticate);

router.post("/:postId", LikesController.createLike);

router.get("/", LikesController.getAllLikes);

router.get("/:id", LikesController.getLikeById);

router.delete("/:id", LikesController.deleteLike);

export default router;
