import { bold } from "colors";
import { Response } from "express";

/**
 * Enumeración de códigos de estado HTTP
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Configuración genérica para enviar respuestas HTTP
 */
interface HttpResponseConfig<T = unknown> {
  res: Response; // Objeto Response de Express
  status?: number; // Código de estado HTTP (opcional)
  message?: string; // Mensaje opcional
  data?: T; // Datos opcionales para incluir en la respuesta
  errors?: string[]; // Lista de errores opcional
}

/**
 * Envía una respuesta HTTP genérica para éxito.
 * @param config Objeto de configuración para la respuesta.
 */
export const sendHttpResponse = <T>({
  res,
  status = HttpStatus.OK,
  message = "Success",
  data,
}: HttpResponseConfig<T>): void => {
  res.status(status).json({
    message,
    data,
  });
};

/**
 * Envía una respuesta HTTP genérica para errores.
 * @param config Objeto de configuración para la respuesta.
 */
export const sendHttpError = ({
  res,
  status = HttpStatus.INTERNAL_SERVER_ERROR,
  message = "An error occurred",
  errors,
}: HttpResponseConfig): void => {
  res.status(status).json({
    message,
    errors,
  });
};
