import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import {
  createUserValidation,
  loginValidation,
  validateResults,
} from "../middlewares/auth.middlewares";

const router: Router = Router();

router.get("/", AuthController.getAllUsers);

router.get("/:id", AuthController.getUserById);

router.post(
  "/create-account",
  createUserValidation,
  validateResults,
  AuthController.createAccount
);

router.post("/login", loginValidation, validateResults, AuthController.login);

router.put(
  "/update/:id",
  createUserValidation,
  validateResults,
  AuthController.updateUser
);

router.delete("/:id", AuthController.deleteUser);

export default router;
