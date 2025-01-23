import { NextFunction } from "express";
import mongoose, { Schema, Document, Types } from "mongoose";
import { ConflictException } from "../errors/exceptions.errors";

export interface IFollowers extends Document {
  follower: Types.ObjectId; // El usuario que sigue a otro usuario
  following: Types.ObjectId; // El usuario al que se sigue
}

const followersSchema = new Schema(
  {
    follower: { type: Types.ObjectId, ref: "User", required: true },
    following: { type: Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// Crear índice compuesto y único para evitar duplicados
followersSchema.index({ follower: 1, following: 1 }, { unique: true });

// Validación para evitar auto-seguimiento
followersSchema.pre("save", function (next: NextFunction) {
  if (this.follower === this.following) {
    next(new ConflictException("Un usuario no puede seguirse a sí mismo"));
  }
  next();
});

const Followers = mongoose.model<IFollowers>("Followers", followersSchema);
export default Followers;
