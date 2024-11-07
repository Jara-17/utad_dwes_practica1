import { Request, Response, NextFunction } from "express";
import { body, ValidationChain, validationResult } from "express-validator";
import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado. Token no provisto." });
  }

  const token = bearer.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return res.status(401).json({ error: "Token no válido." });
    }

    const user = await User.findById(decoded.id).select(
      "_id username fullname email description"
    );

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token no válido o expirado." });
  }
}

// Validación para crear un usuario
export const createUserValidation: ValidationChain[] = [
  body("username")
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio.")
    .isLength({ min: 4 })
    .withMessage("El nombre de usuario debe tener al menos 4 caracteres."),
  body("fullname").notEmpty().withMessage("El nombre completo es obligatorio."),
  body("email")
    .isEmail()
    .withMessage("El correo electrónico no es válido.")
    .notEmpty()
    .withMessage("El correo electrónico es obligatorio."),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria.")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres."),
  body("description")
    .optional()
    .isLength({ max: 200 })
    .withMessage("La descripción no puede exceder los 200 caracteres."),
  body("profilePicture")
    .optional()
    .isString()
    .withMessage("La imagen de perfil debe ser una cadena."),
];

// Validación para iniciar sesión
export const loginValidation: ValidationChain[] = [
  body("email")
    .isEmail()
    .withMessage("El correo electrónico no es válido.")
    .notEmpty()
    .withMessage("El correo electrónico es obligatorio."),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria.")
    .isLength({ min: 6 }),
];

// Middleware para validar resultados
export const validateResults = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  next();
};
