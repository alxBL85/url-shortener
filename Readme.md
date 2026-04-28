# URL Shortener API

Este proyecto es un acortador de URLs basado en Node.js y Express con autenticación JWT. Los datos se almacenan en memoria, por lo que se pierden al detener el servidor.

## Estructura del proyecto

El código está organizado siguiendo una arquitectura MVC:

- `src/models/`: Modelos de datos y lógica de negocio
  - `userModel.js`: Funciones para manejo de usuarios
  - `urlModel.js`: Funciones para manejo de URLs acortadas
- `src/controllers/`: Controladores que manejan las solicitudes HTTP
  - `authController.js`: Registro, login y logout
  - `urlController.js`: Acortar URLs, redireccionar y estadísticas
- `src/middlewares/`: Middlewares personalizados
  - `authMiddleware.js`: Autenticación JWT
- `src/routes/`: Definición de rutas
  - `authRoutes.js`: Rutas de autenticación
  - `urlRoutes.js`: Rutas de URLs
- `main.js`: Punto de entrada, configuración de Express
- `test-shortener.js`: Script de pruebas

## Rutas disponibles

## Rutas disponibles

### Registro de usuario
- Método: `POST`
- Ruta: `/register`
- Body JSON:
  - `username` (string)
  - `email` (string)
  - `password` (string, mínimo 6 caracteres)

Respuesta exitosa:
- `201 Created`
- `{ message: 'User registered successfully', userId: '<id>' }`

### Inicio de sesión
- Método: `POST`
- Ruta: `/login`
- Body JSON:
  - `username` (string)
  - `password` (string)

Respuesta exitosa:
- `200 OK`
- `{ token: '<jwt-token>' }`

### Logout
- Método: `POST`
- Ruta: `/logout`
- Header: `Authorization: Bearer <token>`

Respuesta exitosa:
- `200 OK`
- `{ message: 'Logout successful' }`

> Nota: el token se revoca en memoria, por lo que deja de ser válido tras el logout.

### Acortar una URL
- Método: `POST`
- Ruta: `/shorten`
- Header: `Authorization: Bearer <token>`
- Body JSON:
  - `url` (string)

Respuesta exitosa:
- `201 Created`
- `{ shortUrl: 'http://localhost:3000/<code>' }`

Errores comunes:
- `400 Bad Request` si `url` no es válido o falta.
- `401 Unauthorized` si falta o es inválida la autorización.

### Redireccionar a la URL original
- Método: `GET`
- Ruta: `/:code`
- Header: `Authorization: Bearer <token>`

Comportamiento:
- Busca la URL acortada del usuario autenticado.
- Incrementa el contador de visitas.
- Redirige con `302 Found` a la URL original.

Errores comunes:
- `401 Unauthorized` si falta o es inválido el token.
- `404 Not Found` si el código no existe para el usuario.

### Obtener estadísticas de una URL
- Método: `GET`
- Ruta: `/stats/:code`
- Header: `Authorization: Bearer <token>`

Respuesta exitosa:
- `200 OK`
- `{ code: '<code>', originalUrl: '<originalUrl>', visits: <number> }`

Errores comunes:
- `401 Unauthorized` si falta o es inválido el token.
- `404 Not Found` si el código no existe para el usuario.

## Detalles de implementación

- El servidor corre en `http://localhost:3000`.
- La autenticación usa JWT con secreto definido en `main.js` como `JWT_SECRET`.
- Los usuarios y short URLs se guardan en arrays/objetos en memoria.
- Cada usuario tiene su propio conjunto de URLs acortadas, por lo que los códigos se buscan en el contexto del usuario autenticado.
- Se usa `bcryptjs` para hashear contraseñas.
- La ruta `/:code` requiere autorización, por lo que solo el usuario que creó la URL puede acceder a esa redirección y a sus estadísticas.

## Ejecución

Instala dependencias:

```bash
npm install
```

Inicia la aplicación:

```bash
npm run dev
```

Ejecuta las pruebas:

```bash
npm run test
```

Luego prueba los endpoints con herramientas como `curl`, Postman o Insomnia.

## Advertencia

- Este proyecto no es apto para producción tal como está.
- Cambia `JWT_SECRET` por una variable de entorno segura en un entorno real.
- El almacenamiento en memoria no es persistente.

