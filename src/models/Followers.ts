import mongoose, { Schema, Document, Types } from "mongoose";

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

const Followers = mongoose.model<IFollowers>("Followers", followersSchema);
export default Followers;
