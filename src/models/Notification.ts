import { Document, model, Schema, Types } from "mongoose";

export type NotificationType = "newFollower" | "newLike" | "newMessage";

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  content: string;
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["newFollower", "newLike", "newMessage"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para optimizar búsquedas de notificaciones por usuario
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = model<INotification>("Notification", notificationSchema);
export default Notification;
