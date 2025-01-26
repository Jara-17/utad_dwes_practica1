import { body, ValidationChain } from "express-validator";

// Validación para crear un usuario
export const createAccountValidation: ValidationChain[] = [
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

// Validación para actualizar un usuario
export const updateAccountValidation: ValidationChain[] = [
  body("username")
    .optional()
    .isLength({ min: 4 })
    .withMessage("El nombre de usuario debe tener al menos 4 caracteres."),
  body("fullname").notEmpty().withMessage("El nombre completo es obligatorio."),
  body("email")
    .isEmail()
    .withMessage("El correo electrónico no es válido.")
    .notEmpty()
    .withMessage("El correo electrónico es obligatorio."),
  body("description")
    .optional()
    .isLength({ max: 200 })
    .withMessage("La descripción no puede exceder los 200 caracteres."),
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
