import { Schema, model, Document, Types } from "mongoose";
import { IPost } from "./Post";

export interface IUser extends Document {
  username: string;
  fullname: string;
  email: string;
  password: string;
  description: string;
  profilePicture?: string;
  token?: string;
  posts: Types.ObjectId[];
  isDeleted: boolean;
  deletedAt?: Date;
  originalEmail?: string;
  originalUsername?: string;
}

const userSchema = new Schema<IUser>(
  {
    username: { 
      type: String, 
      required: true,
      sparse: true,
      index: {
        unique: true,
        partialFilterExpression: { isDeleted: false }
      }
    },
    fullname: { type: String, required: true },
    email: { 
      type: String, 
      required: true,
      lowercase: true,
      sparse: true,
      index: {
        unique: true,
        partialFilterExpression: { isDeleted: false }
      }
    },
    password: { type: String, required: true },
    description: { type: String, required: false },
    profilePicture: { type: String, required: false },
    token: { type: String, required: false },
    posts: [{ type: Types.ObjectId, ref: "Post" }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, required: false },
    // Guardamos los valores originales para referencia
    originalEmail: { type: String, required: false },
    originalUsername: { type: String, required: false }
  },
  {
    timestamps: true,
  }
);

// Middleware pre-save para manejar el borrado lógico
userSchema.pre('save', function(next) {
  if (this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
    // Guardamos los valores originales antes de modificarlos
    this.originalEmail = this.email;
    this.originalUsername = this.username;
    // Generamos valores únicos para email y username
    const timestamp = Date.now();
    this.email = `deleted_${timestamp}_${this._id}@deleted.user`;
    this.username = `deleted_${timestamp}_${this._id}`;
  }
  next();
});

const User = model<IUser>("User", userSchema);
export default User;
