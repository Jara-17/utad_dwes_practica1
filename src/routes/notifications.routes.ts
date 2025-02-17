import express from "express";
import { NotificationController } from "../controllers/NotificationController";
import { authenticate } from "../middlewares/auth.middlewares";

const router = express.Router();

router.use(authenticate);

router.post("/", NotificationController.createNotification);
router.get("/:userId", NotificationController.getUserNotifications);
router.patch("/:notificationId", NotificationController.markAsRead);
router.patch("/mark-all", NotificationController.markAllAsRead);
router.delete("/:notificationId", NotificationController.deleteNotification);

export default router;
