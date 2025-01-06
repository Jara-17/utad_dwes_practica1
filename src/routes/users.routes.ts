import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticate, validateResults } from "../middlewares/auth.middlewares";
import FollowersController from "../controllers/FollowersController";
import {
  createAccountValidation,
  loginValidation,
} from "../validators/auth.validator";

const router: Router = Router();

router.post(
  "/create-account",
  createAccountValidation,
  validateResults,
  AuthController.createAccount
);
router.post("/login", loginValidation, validateResults, AuthController.login);

router.use(authenticate);

router.get("/users", AuthController.getAllUsers);
router.get("/users/:userId", AuthController.getUserById);

router.put(
  "/update-profile",
  createAccountValidation,
  validateResults,
  AuthController.updateUser
);
router.delete("/delete-account", AuthController.deleteUser);

// Rutas de Seguidores
router.post(
  "/:userId/followers/:followingId",
  FollowersController.createFollower
);
router.get("/:userId/followers", FollowersController.getFollowers);
router.get("/:userId/following", FollowersController.getFollowing);
router.delete(
  "/:userId/followers/:followingId",
  FollowersController.deleteFollower
);

export default router;
