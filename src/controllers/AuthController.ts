import { Request, Response } from "express";
import UserService from "../services/UserService";
import { bold } from "colors";
import {
  NotFoundException,
  ConflictException,
} from "../errors/exceptions.errors";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const user = req.body;

    try {
      await UserService.createUser(user);
      res.status(201).json({
        message: `Se ha creado la cuenta con éxito`,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        res.status(400).json({ message: error.message });
      } else {
        console.error("Error al crear la cuenta:", bold.red(error.message));
        res.status(500).json({ message: error.message });
      }
    }
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const token = await UserService.login(email, password);
      res.status(200).json({ token });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(404).json({ message: error.message });
      } else if (error instanceof ConflictException) {
        return res.status(401).json({ message: error.message });
      } else {
        console.error("Error al iniciar sesión:", bold.red(error.message));
        res.status(500).json({ message: error.message });
      }
    }
  };

  static getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await UserService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error al buscar los usuarios:", bold.red(error.message));
      res.status(500).json({ message: error.message });
    }
  };

  static getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const user = await UserService.getUserById(id);
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        console.error("Error al buscar el usuario:", bold.red(error.message));
        res.status(500).json({ message: error.message });
      }
    }
  };

  static updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.body;

    try {
      await UserService.updateUser(id, user);
      res.status(200).json({
        message: `El usuario se ha actualizado con éxito!`,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        console.error(
          "Error al actualizar el usuario:",
          bold.red(error.message)
        );
        res.status(500).json({ message: error.message });
      }
    }
  };

  static deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await UserService.deleteUser(id);
      res.status(200).json({
        message: `Usuario eliminado con éxito!`,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        console.error("Error al eliminar el usuario:", bold.red(error.message));
        res.status(500).json({ message: error.message });
      }
    }
  };
}
