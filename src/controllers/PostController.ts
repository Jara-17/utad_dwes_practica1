import { Request, Response } from "express";
import PostService from "../services/PostService";
import { bold } from "colors";
import {
  NotFoundException,
  InternalServerErrorException,
} from "../errors/exceptions.errors";

export class PostController {
  static createPost = async (req: Request, res: Response) => {
    const userId = req.user._id;
    const post = req.body;

    try {
      await PostService.createPost(userId.toString(), post);
      res.status(201).json({ message: "Post creado con éxito" });
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        console.error(`Error al crear el post: ${bold.red(error.message)}`);
        res.status(500).json({ message: error.message });
      } else {
        console.error(`Error al crear el post: ${bold.red(error.message)}`);
        res.status(400).json({ message: error.message });
      }
    }
  };

  static getAllPosts = async (req: Request, res: Response) => {
    try {
      const posts = await PostService.getAllPosts();
      res.status(200).json(posts);
    } catch (error) {
      console.error(`Error al obtener los posts: ${bold.red(error.message)}`);
      res.status(500).json({ message: error.message });
    }
  };

  static getPostById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const post = await PostService.getPostById(id);
      res.status(200).json(post);
    } catch (error) {
      console.error(`Error al obtener el post: ${bold.red(error.message)}`);
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  };

  static updatePost = async (req: Request, res: Response) => {
    const { id } = req.params;
    const post = req.body;

    try {
      await PostService.updatePost(id, post);
      res.status(200).json("Post actualizado con éxito");
    } catch (error) {
      console.error(`Error al actualizar el post: ${bold.red(error.message)}`);
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  };

  static deletePost = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await PostService.deletePost(id);
      res.status(200).json("Post eliminado con éxito");
    } catch (error) {
      console.error(`Error al eliminar el post: ${bold.red(error.message)}`);
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  };
}
