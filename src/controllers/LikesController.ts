import { Request, Response } from "express";
import LikesService from "../services/LikesService";
import { bold } from "colors";
import {
  NotFoundException,
  ConflictException,
} from "../errors/exceptions.errors";

export class LikesController {
  static createLike = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const postId = req.params.postId;

    try {
      await LikesService.createLike(userId.toString(), postId);
      res.status(201).json({ message: `${req.user.username} has dado like` });
    } catch (error) {
      if (error instanceof ConflictException) {
        res.status(409).json({ message: error.message });
      } else {
        console.error(`Error al crear el like: ${bold.red(error.message)}`);
        res.status(500).json({ message: error.message });
      }
    }
  };

  static getAllLikes = async (req: Request, res: Response) => {
    try {
      const likes = await LikesService.getAllLikes();
      res.status(200).json(likes);
    } catch (error) {
      console.error(`Error al obtener los likes: ${bold.red(error.message)}`);
      res.status(500).json({ message: error.message });
    }
  };

  static getLikeById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const like = await LikesService.getLikeById(id);
      res.status(200).json(like);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        console.error(`Error al obtener el like: ${bold.red(error.message)}`);
        res.status(500).json({ message: error.message });
      }
    }
  };

  static deleteLike = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await LikesService.deleteLike(id);
      res.status(200).json({ message: "Like eliminado con éxito." });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        console.error(`Error al eliminar el like: ${bold.red(error.message)}`);
        res.status(500).json({ message: error.message });
      }
    }
  };
}

export default LikesController;
