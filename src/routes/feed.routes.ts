import { Router } from "express";
import { authenticate } from "../middlewares/auth.middlewares";
import { FeedController } from "../controllers/FeedController";

const router = Router();
router.use(authenticate);

router.get("/", FeedController.getFeed);

export default router;
