# Proyecto de API de Red Social 🌐

## Descripción General 📝

Este proyecto es un prototipo de API para una red social, desarrollado como parte de la actividad práctica de la Unidad 2 en la U-tad. La aplicación proporciona una plataforma completa para la interacción social en línea, implementada con tecnologías modernas de desarrollo web.

## Características Principales ✨

### Funcionalidades
- 👤 **Gestión de Usuarios**
  - Registro y autenticación segura con JWT
  - Perfiles personalizables con validación de datos
  - Gestión completa de información personal

- 📝 **Sistema de Posts**
  - Publicación de contenido con texto e imágenes
  - Soporte para múltiples formatos de contenido
  - Gestión de publicaciones (crear, leer, eliminar)

- 🤝 **Interacciones Sociales**
  - Seguimiento de usuarios
  - Sistema de likes
  - Feed personalizado
  - Validación de interacciones

## Arquitectura del Proyecto 🏗️

### Estructura de Directorios
```
src/
├── config/         # Configuraciones de la aplicación
├── controllers/    # Lógica de control de las rutas
├── errors/         # Manejo personalizado de errores
├── middlewares/    # Middleware de autenticación y validación
├── models/         # Modelos de datos de MongoDB
├── repositories/   # Capa de acceso a datos
├── routes/         # Definición de rutas de la API
├── services/       # Lógica de negocio
├── tests/          # Pruebas unitarias e integración
├── types/          # Definiciones de tipos TypeScript
├── uploads/        # Almacenamiento de archivos subidos
├── utils/          # Utilidades y funciones auxiliares
└── validators/     # Validadores de entrada
```

## Tecnologías y Herramientas 🛠️

### Backend
- **Lenguaje**: TypeScript
- **Framework**: Express.js
- **Base de Datos**: MongoDB
- **ODM**: Mongoose
- **Autenticación**: JSON Web Tokens (JWT)
- **Logging**: Winston
- **Documentación**: Swagger

### Dependencias Principales
- `express`: Framework web
- `mongoose`: Modelado de datos de MongoDB
- `jsonwebtoken`: Generación y validación de tokens
- `bcrypt`: Hasheo de contraseñas
- `dotenv`: Gestión de variables de entorno
- `cors`: Middleware de seguridad para CORS
- `helmet`: Protección de cabeceras HTTP
- `express-validator`: Validación de datos
- `nodemailer`: Envío de correos electrónicos
- `multer`: Gestión de subida de archivos
- `winston`: Registro de logs

### Dependencias de Desarrollo
- TypeScript
- Jest (pruebas)
- Nodemon
- ts-node

## Requisitos Previos 📋

- Node.js (v18 o superior)
- MongoDB (v6 o superior)
- npm (v9 o superior)

## Instalación 🚀

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/JARA-17/utad_dwes_practica1.git
   cd utad_dwes_practica1
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Crear un archivo `.env` en la raíz del proyecto
   - Añadir las siguientes variables:
     ```
     MONGODB_URI=mongodb://localhost:27017/redsocial
     JWT_SECRET=tu_secreto_seguro
     PORT=3000
     SLACK_WEBHOOK_URL=opcional_para_notificaciones
     ```

4. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

## Endpoints de la API 🌍

### Autenticación de Usuarios 🔐

- `POST /api/auth/create-account`: Registro de nuevo usuario
  - Crea una cuenta con nombre completo, correo electrónico, nombre de usuario, contraseña y descripción opcional
  - Validación de datos de entrada
  - Hasheo de contraseña
  - Genera token JWT

- `POST /api/auth/login`: Inicio de sesión
  - Autenticación con correo electrónico y contraseña
  - Genera token JWT para sesiones posteriores
  - Manejo de errores de autenticación

- `GET /api/auth/users/`: Obtener perfil de usuario
  - Requiere autenticación JWT
  - Devuelve información detallada del perfil de usuario

- `PUT /api/auth/users/`: Actualizar perfil
  - Requiere autenticación JWT
  - Permite actualizar información personal
  - Soporte para subir foto de perfil

- `DELETE /api/auth/users/`: Eliminar cuenta de usuario
  - Requiere autenticación JWT
  - Elimina permanentemente la cuenta y datos asociados

### Publicaciones 📝
- `POST /api/posts`: Crear nueva publicación
  - Requiere autenticación JWT
  - Permite publicar contenido con texto e imagen opcional
  - Validación de contenido

- `GET /api/posts`: Listar publicaciones
  - Obtener listado de publicaciones
  - Soporte para paginación
  - Filtrado opcional

- `GET /api/posts/:id`: Obtener publicación específica
  - Detalles completos de una publicación
  - Incluye información del autor, likes, etc.

- `DELETE /api/posts/:id`: Eliminar publicación
  - Requiere autenticación JWT
  - Solo el autor puede eliminar su propia publicación

### Interacción con Publicaciones 👍
- `POST /api/posts/:postId/like`: Dar/Quitar like a una publicación
  - Requiere autenticación JWT
  - Permite dar o quitar like a una publicación
  - Previene múltiples likes del mismo usuario

- `GET /api/posts/:postId/likes`: Listar likes de una publicación
  - Devuelve listado de usuarios que han dado like

### Seguidores 🤝
- `POST /api/followers/:userId`: Seguir/Dejar de seguir usuario
  - Requiere autenticación JWT
  - Permite seguir o dejar de seguir a otro usuario
  - Gestiona relaciones de seguimiento

- `GET /api/followers`: Listar seguidores y seguidos
  - Devuelve listados de seguidores y usuarios seguidos
  - Información detallada de cada usuario

### Feed 📰
- `GET /api/feed`: Obtener feed personalizado
  - Requiere autenticación JWT
  - Devuelve publicaciones de usuarios seguidos
  - Ordenado por fecha de publicación
  - Soporte para paginación

### Características Adicionales
- Todas las rutas protegidas con autenticación JWT
- Validación de datos de entrada
- Manejo de errores personalizado
- Documentación completa con Swagger

## Documentación de la API 📖

La documentación completa de la API está disponible mediante Swagger:
- URL de Swagger: `http://localhost:3000/api-docs`

## Pruebas 🧪

Ejecutar pruebas unitarias y de integración:
```bash
npm test
```

## Seguridad 🔒

- Autenticación basada en JWT
- Protección contra ataques CORS
- Validación de entrada
- Hasheo de contraseñas
- Límites de tasa de solicitudes
- Protección de cabeceras HTTP

## Contribución 🤝

1. Hacer fork del repositorio
2. Crear rama de características (`git checkout -b feature/nueva-caracteristica`)
3. Confirmar cambios (`git commit -am 'Añadir nueva característica'`)
4. Subir rama (`git push origin feature/nueva-caracteristica`)
5. Crear un Pull Request

## Contacto 📧

- **Autor**: Juan Rosales
- **GitHub**: [@JARA-17](https://github.com/JARA-17)
- **Proyecto**: [Repositorio GitHub](https://github.com/JARA-17/utad_dwes_practica1)

---

**Nota**: Este proyecto es un prototipo académico desarrollado para la práctica de Desarrollo Web en Entorno Servidor. Está en constante desarrollo y las contribuciones son bienvenidas. 🚀
