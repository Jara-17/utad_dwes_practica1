import { Request, Response } from "express";
import FollowersService from "../services/FollowersService";
import { bold } from "colors";
import {
  NotFoundException,
  ConflictException,
} from "../errors/exceptions.errors";

export class FollowersController {
  /**
   * Crea una nueva relación de seguimiento.
   * @param {Request} req - La solicitud HTTP.
   * @param {Response} res - La respuesta HTTP.
   */
  static createFollower = async (req: Request, res: Response) => {
    const followerId = req.user._id; // Asumiendo que el ID del seguidor está en req.user
    const followingId = req.params.followingId; // Asumiendo que el ID del seguido se pasa como parámetro de ruta

    try {
      const follower = await FollowersService.createFollower(
        followerId.toString(),
        followingId
      );
      res.status(201).json(follower);
    } catch (error) {
      if (error instanceof ConflictException) {
        res.status(409).json({ message: error.message });
      } else {
        console.error(
          `Error al crear la relación de seguimiento: ${bold.red(
            error.message
          )}`
        );
        res.status(500).json({ message: error.message });
      }
    }
  };

  /**
   * Obtiene todos los seguidores de un usuario.
   * @param {Request} req - La solicitud HTTP.
   * @param {Response} res - La respuesta HTTP.
   */
  static getFollowers = async (req: Request, res: Response) => {
    const userId = req.params.userId; // Asumiendo que el ID del usuario se pasa como parámetro de ruta

    try {
      const followers = await FollowersService.getFollowers(userId);
      res.status(200).json(followers);
    } catch (error) {
      console.error(
        `Error al obtener los seguidores: ${bold.red(error.message)}`
      );
      res.status(500).json({ message: error.message });
    }
  };

  /**
   * Obtiene todos los usuarios que sigue un usuario.
   * @param {Request} req - La solicitud HTTP.
   * @param {Response} res - La respuesta HTTP.
   */
  static getFollowing = async (req: Request, res: Response) => {
    const userId = req.params.userId; // Asumiendo que el ID del usuario se pasa como parámetro de ruta

    try {
      const following = await FollowersService.getFollowing(userId);
      res.status(200).json(following);
    } catch (error) {
      console.error(
        `Error al obtener los seguidos: ${bold.red(error.message)}`
      );
      res.status(500).json({ message: error.message });
    }
  };

  /**
   * Elimina una relación de seguimiento.
   * @param {Request} req - La solicitud HTTP.
   * @param {Response} res - La respuesta HTTP.
   */
  static deleteFollower = async (req: Request, res: Response) => {
    const { followingId } = req.params;

    try {
      await FollowersService.deleteFollower(followingId);
      res
        .status(200)
        .json({ message: "Relación de seguimiento eliminada con éxito." });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        console.error(
          `Error al eliminar la relación de seguimiento: ${bold.red(
            error.message
          )}`
        );
        res.status(500).json({ message: error.message });
      }
    }
  };
}

export default FollowersController;
