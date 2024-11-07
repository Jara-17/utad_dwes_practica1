import { Router } from "express";
import { FollowersController } from "../controllers/FollowersController";
import { authenticate } from "../middlewares/auth.middlewares";

const router = Router();

router.use(authenticate);

router.post("/:followingId", FollowersController.createFollower);

router.get("/:userId/followers", FollowersController.getFollowers);

router.get("/:userId/following", FollowersController.getFollowing);

router.delete("/:followingId", FollowersController.deleteFollower);

export default router;
