import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface ILikes extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
  getLikesCount(postId: Types.ObjectId): Promise<number>;
}

interface LikesModel extends Model<ILikes> {
  /**
   * Encuentra el conteo de likes de un post.
   * @param {string} postId - ID del post.
   * @returns {Promise<number>} - Conteo de likes.
   */
  getLikesCount(postId: Types.ObjectId): Promise<number>;
}

const likesSchema = new Schema<ILikes, LikesModel>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, "El usuario es obligatorio"] 
    },
    post: { 
      type: Schema.Types.ObjectId, 
      ref: "Post", 
      required: [true, "El post es obligatorio"] 
    },
  },
  {
    timestamps: true,
    // Añadir validación de esquema
    strict: true,
  }
);

// Índice único para evitar likes duplicados
likesSchema.index({ user: 1, post: 1 }, { unique: true });

// Middleware de validación pre-guardado
likesSchema.pre('save', async function(next) {
  try {
    // Validar existencia de usuario y post
    const userExists = await mongoose.models.User.exists({ _id: this.user });
    const postExists = await mongoose.models.Post.exists({ _id: this.post });
    
    if (!userExists) {
      return next(new Error('Usuario no válido'));
    }
    
    if (!postExists) {
      return next(new Error('Post no válido'));
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Método estático para contar likes de un post
likesSchema.statics.getLikesCount = async function(postId: Types.ObjectId) {
  return this.countDocuments({ post: postId });
};

const Likes = mongoose.model<ILikes, LikesModel>("Likes", likesSchema);
export default Likes;
