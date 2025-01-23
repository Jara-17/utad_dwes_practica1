import mongoose, { Schema, Document, Types, Model, Query } from "mongoose";
import Likes from "./Likes";
import { NextFunction } from "express";

// Interfaz para métodos de instancia
export interface IPostMethods {
  getLikesCount(): Promise<number>;
  isLikedByUser(userId: Types.ObjectId): Promise<boolean>;
}

// Interfaz para métodos estáticos
export interface IPostModel extends Model<IPost, {}, IPostMethods> {
  findByUser(userId: Types.ObjectId): Promise<IPost[]>;
}

// Interfaz principal del Post
export interface IPost extends Document {
  header: string;
  content: string;
  user: Types.ObjectId;
  image?: string;
  likes?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema(
  {
    header: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      minlength: [3, "El título debe tener al menos 3 caracteres"],
      maxlength: [100, "El título no puede exceder los 100 caracteres"],
    },

    content: {
      type: String,
      required: [true, "El contenido es obligatorio"],
      trim: true,
      minlength: [10, "El contenido debe tener al menos 10 caracteres"],
      maxlength: [2000, "El contenido no puede exceder los 2000 caracteres"],
    },

    user: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "El usuario es obligatorio"],
      index: true,
    },

    image: {
      type: String,
      required: false,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v);
        },
        message: "La URL de la imagen no es válida"
      }
    },

    likes: [
      {
        type: Types.ObjectId,
        ref: "Likes",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índices
postSchema.index({ createdAt: -1 }); // Para ordenar por fecha
postSchema.index({ header: "text", content: "text" }); // Para búsqueda por texto

// Virtuals
postSchema.virtual("likesCount").get(function() {
  return this.likes?.length || 0;
});

// Métodos de instancia
postSchema.methods.getLikesCount = async function(): Promise<number> {
  return await Likes.countDocuments({ post: this._id });
};

postSchema.methods.isLikedByUser = async function(userId: Types.ObjectId): Promise<boolean> {
  const like = await Likes.findOne({ post: this._id, user: userId });
  return !!like;
};

// Métodos estáticos
postSchema.statics.findByUser = async function(userId: Types.ObjectId): Promise<IPost[]> {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Middleware para eliminar los likes asociados antes de eliminar un post
postSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const postId = this._id;
      if (!postId) return next();
      await Likes.deleteMany({ post: postId });
      next();
    } catch (error) {
      next(error);
    }
  }
);

// Middleware para poblar automáticamente el usuario
postSchema.pre(/^find/, function(this: Query<IPost, IPost>, next: NextFunction) {
  this.populate('user', 'username email');
  next();
});

const Post = mongoose.model<IPost, IPostModel>("Post", postSchema);
export default Post;
