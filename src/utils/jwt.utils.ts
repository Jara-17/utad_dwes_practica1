import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { env } from "../config/env.config";

type UserPayload = {
  id: Types.ObjectId;
};

export const generateJWT = (payload: UserPayload) => {
  const token = jwt.sign(payload, env.secret_key, {
    expiresIn: "90d",
  });

  return token;
};
