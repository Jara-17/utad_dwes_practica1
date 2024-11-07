# Proyecto de API de Red Social

Este proyecto es un prototipo de una API para una red social, desarrollado como parte de la actividad práctica de la Unidad 2 en la U-tad. La API permite gestionar usuarios, posts, seguidores, likes y el feed de la red social.

## Descripción

La API está diseñada para manejar las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para los siguientes componentes:

- **Usuarios**: Incluye propiedades como nombre de usuario, nombre completo, descripción, correo electrónico, foto de perfil y contraseña.
- **Posts**: Incluye el usuario propietario, contenido de texto y una imagen opcional.
- **Seguidores**: Gestiona las relaciones de seguimiento entre usuarios.
- **Likes**: Permite a los usuarios dar "me gusta" a los posts.
- **Feed**: Devuelve los posts de los usuarios que un usuario sigue.

## Tecnologías Utilizadas

- Node.js
- Express.js
- Mongoose (para la gestión de la base de datos MongoDB)
- JWT para autenticación

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/utad_dwes_practica1.git
   ```

2. Navega al directorio del proyecto:

   ```bash
   cd utad_dwes_practica1
   ```

3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Configura las variables de entorno necesarias en un archivo `.env`.

5. Inicia la API:

   ```bash
   npm run dev
   ```

## Uso

- **Rutas de Usuarios**: `/api/users`
- **Rutas de Posts**: `/api/posts`
- **Rutas de Seguidores**: `/api/followers`
- **Rutas de Likes**: `/api/likes`
- **Ruta del Feed**: `/api/feed`

## Pruebas

Para ejecutar las pruebas, utiliza el siguiente comando:

```bash
npm test
```

## Autor

- [Juan Rosales](https://github.com/JARA-17)
