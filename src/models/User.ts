import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  fullname: string;
  email: string;
  password: string;
  description: string;
  profilePicture?: string;
  token?: string;
  isDeleted: boolean;
  deletedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    description: { type: String, required: false },
    profilePicture: { type: String, required: false },
    token: { type: String, required: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>("User", userSchema);
export default User;
