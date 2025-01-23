import { Response } from "express";

/**
 * Enumeración de códigos de estado HTTP
 */
export enum HttpStatus {
  // Success responses (2xx)
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // Client error responses (4xx)
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // Server error responses (5xx)
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Tipo base para respuestas HTTP
 */
interface BaseHttpResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Tipo para respuestas HTTP exitosas
 */
export interface SuccessResponse<T = unknown> extends BaseHttpResponse {
  success: true;
  data?: T;
}

/**
 * Tipo para respuestas HTTP de error
 */
export interface ErrorResponse extends BaseHttpResponse {
  success: false;
  errors?: string[];
  errorCode?: string;
}

/**
 * Configuración para respuestas HTTP
 */
interface HttpResponseConfig<T = unknown> {
  res: Response;
  status?: number;
  message?: string;
  data?: T;
  errors?: string[];
  errorCode?: string;
}

/**
 * Envía una respuesta HTTP exitosa.
 * @param config Configuración de la respuesta
 * @example
 * sendHttpResponse({
 *   res,
 *   status: HttpStatus.CREATED,
 *   message: "Usuario creado con éxito",
 *   data: { id: "123", username: "john" }
 * });
 */
export const sendHttpResponse = <T>({
  res,
  status = HttpStatus.OK,
  message = "Success",
  data,
}: HttpResponseConfig<T>): void => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };

  res.status(status).json(response);
};

/**
 * Envía una respuesta HTTP de error.
 * @param config Configuración de la respuesta de error
 * @example
 * sendHttpError({
 *   res,
 *   status: HttpStatus.NOT_FOUND,
 *   message: "Usuario no encontrado",
 *   errorCode: "USER_NOT_FOUND",
 *   errors: ["El usuario con ID 123 no existe"]
 * });
 */
export const sendHttpError = ({
  res,
  status = HttpStatus.INTERNAL_SERVER_ERROR,
  message = "An error occurred",
  errors,
  errorCode,
}: HttpResponseConfig): void => {
  const response: ErrorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(errors && { errors }),
    ...(errorCode && { errorCode }),
  };

  res.status(status).json(response);
};
