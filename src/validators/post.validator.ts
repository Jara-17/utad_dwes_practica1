import { body, param, ValidationChain } from "express-validator";

// Validación para post
export const PostValidation: ValidationChain[] = [
  body("header")
    .notEmpty()
    .withMessage("El encabezado es obligatorio.")
    .isLength({ min: 4 })
    .withMessage("El encabezado debe tener al menos 4 caracteres."),
  body("content").notEmpty().withMessage("El contenido es obligatorio."),
];
