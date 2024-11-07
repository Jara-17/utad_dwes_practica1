import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILikes extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
}

const likesSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    post: { type: Types.ObjectId, ref: "Post", required: true },
  },
  {
    timestamps: true,
  }
);

const Likes = mongoose.model<ILikes>("Likes", likesSchema);
export default Likes;
