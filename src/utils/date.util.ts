/**
 * Formatea una fecha al formato día/mes/año.
 * @param date Fecha a formatear (objeto Date o cadena válida).
 * @returns Fecha formateada como una cadena en el formato día/mes/año.
 */
export const formatDate = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    throw new Error(
      "Fecha inválida. Proporcione un objeto Date o una cadena válida."
    );
  }

  const day = parsedDate.getDate().toString().padStart(2, "0");
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0"); // Los meses comienzan en 0
  const year = parsedDate.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha al formato día/mes/año a las hora:min AM/PM.
 * @param date Fecha a formatear (objeto Date o cadena válida).
 * @returns Fecha formateada como una cadena en el formato especificado.
 */
export const formatDateTime = (date: Date | string): string => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    throw new Error(
      "Fecha inválida. Proporcione un objeto Date o una cadena válida."
    );
  }

  const day = parsedDate.getDate().toString().padStart(2, "0");
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0"); // Los meses comienzan en 0
  const year = parsedDate.getFullYear();

  let hours = parsedDate.getHours();
  const minutes = parsedDate.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";

  // Convertir a formato de 12 horas
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} a las ${hours}:${minutes} ${period}`;
};
