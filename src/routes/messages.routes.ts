import express from "express";
import { MessageController } from "../controllers/MessageController";
import { authenticate } from "../middlewares/auth.middlewares";

const router = express.Router();

router.use(authenticate);

router.post("/send", MessageController.sendMessage);
router.get("/:userId", MessageController.getUserMessages);
router.get("/:senderId/:receiverId", MessageController.getConversation);
router.delete("/", MessageController.deleteMessage);

export default router;
