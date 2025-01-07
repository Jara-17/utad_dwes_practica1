import { OpenAPIV3 } from "openapi-types";

const swaggerConfig: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Mi API Documentada con Swagger",
    version: "1.0.0",
    description: "Documentación separada de Swagger para cada módulo",
  },
  servers: [
    {
      url: `http://localhost:`,
      description: "Servidor local",
    },
  ],

  paths: {},
};

export default swaggerConfig;
