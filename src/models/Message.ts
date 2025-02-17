import { Document, model, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  isRead: boolean;
  deletedBy: Types.ObjectId[];
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    content: {
      type: String,
      required: [true, "El contenido es obligatorio"],
      trim: true,
      maxlength: [2000, "El contenido no puede exceder los 2000 caracteres"],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    deletedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const Message = model<IMessage>("Message", messageSchema);
export default Message;
