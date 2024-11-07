import { Request, Response } from "express";
import Post from "../models/Post";
import Followers, { IFollowers } from "../models/Followers";

export class FeedController {
  // Método para obtener el feed del usuario autenticado
  static getFeed = async (req: Request, res: Response) => {
    // Obtener el userId del usuario autenticado
    const { id } = req.user; // Asegúrate de que req.user está configurado correctamente

    try {
      // Obtener los usuarios que el usuario sigue
      const following = await Followers.find({ follower: id }).select(
        "following"
      );

      // Extraer los IDs de los usuarios seguidos
      const followingIds = following.map((f: IFollowers) => f.following);

      // Obtener los posts de los usuarios seguidos
      const posts = await Post.find({ user: { $in: followingIds } })
        .sort({
          createdAt: -1,
        })
        .populate({
          path: "user",
          select: "_id username email fullname",
        });

      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el feed", error });
    }
  };
}
