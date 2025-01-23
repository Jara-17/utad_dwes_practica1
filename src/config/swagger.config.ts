import swaggerJSDoc, { SwaggerDefinition } from "swagger-jsdoc";
import { env } from "./env.config";

export const swaggerOptions: SwaggerDefinition & { apis: string[] } = {
  openapi: "3.0.0",
  info: {
    title: "Twitter Clone API",
    version: "1.0.0",
    description: "Twitter Clone API with express, typescript and mongo db.",
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "60a2f7b5e6a3b3f7a8a0b4e3",
          },
          fullname: {
            type: "string",
            example: "John Doe",
          },
          email: {
            type: "string",
            example: "example@example.com",
          },
          password: {
            type: "string",
            example: "password",
          },
          username: {
            type: "string",
            example: "johndoe",
          },
          description: {
            type: "string",
            example: "I'm a software engineer",
          },
          profilePicture: {
            type: "string",
            example: "https://example.com/profile.jpg",
          },
        },
        required: ["fullname", "email", "password", "username"],
      },
      Post: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "60a2f7b5e6a3b3f7a8a0b4e4",
          },
          content: {
            type: "string",
            example: "Hello, world!",
          },
          user: {
            $ref: "#/components/schemas/User",
          },
          image: {
            type: "string",
            example: "https://example.com/image.jpg",
          },
          likes: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Like",
            },
          },
        },
        required: ["content"],
      },
      Follow: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "60a2f7b5e6a3b3f7a8a0b4e5",
          },
          follower: {
            $ref: "#/components/schemas/User",
          },
          following: {
            $ref: "#/components/schemas/User",
          },
        },
        required: ["follower", "following"],
      },
      Like: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "60a2f7b5e6a3b3f7a8a0b4e6",
          },
          post: {
            $ref: "#/components/schemas/Post",
          },
          user: {
            $ref: "#/components/schemas/User",
          },
        },
        required: ["post"],
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  apis: ["src/routes/*.ts"],
};
