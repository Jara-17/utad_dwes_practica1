import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPost extends Document {
  content: string;
  user: Types.ObjectId;
  image?: string;
}

const postSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },

    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    image: { type: String, required: false },
  },
  { timestamps: true }
);

const Post = mongoose.model<IPost>("Post", postSchema);
export default Post;
