# Selaski Backend - NestJS + Prisma API

API REST desarrollada con NestJS y Prisma ORM que maneja usuarios y mensajes.

## Descripción

Esta API permite:
- Crear usuarios con validación de email
- Crear mensajes asociados a usuarios
- Listar mensajes de un usuario específico

## Tecnologías

- NestJS
- Prisma ORM
- MySQL
- class-validator
- TypeScript

## Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura tu base de datos MySQL:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tu configuración de MySQL:
```
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/nombre_base_datos"
```

## Instalación

```bash
# Instalar dependencias
pnpm install

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy
```

## Ejecutar el proyecto

```bash
# Desarrollo
pnpm run start:dev

# Producción
pnpm run start:prod
```

## Documentación API

Una vez ejecutado el proyecto, la documentación interactiva estará disponible en:
```
http://localhost:3000/api
```

## Endpoints

### Crear Usuario
```http
POST /users
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com"
}

# Respuesta:
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

### Crear Mensaje
```http
POST /messages
Content-Type: application/json

{
  "content": "Hola mundo",
  "userId": 1
}

# Respuesta:
{
  "success": true,
  "message": "Message created successfully",
  "data": {
    "id": 1,
    "content": "Hola mundo",
    "userId": 1,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Listar Mensajes de Usuario
```http
GET /users/:id/messages

# Con filtros opcionales:
GET /users/1/messages?content=hola&after=2024-01-01T00:00:00.000Z&limit=10

# Respuesta:
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": [
    {
      "id": 1,
      "content": "Hola mundo",
      "userId": 1,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

## Pruebas

```bash
# Pruebas unitarias
pnpm run test

# Pruebas e2e
pnpm run test:e2e

# Cobertura
pnpm run test:cov
```

## Estructura del Proyecto

```
src/
├── user/
│   ├── dto/
│   │   └── create-user.dto.ts
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.module.ts
├── message/
│   ├── dto/
│   │   └── create-message.dto.ts
│   ├── message.controller.ts
│   ├── message.service.ts
│   └── message.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── main.ts
```

## Validaciones

- **Email**: Formato válido requerido
- **Content**: No puede estar vacío
- **Name**: No puede estar vacío
- **UserId**: Debe ser un número entero

## Filtros Opcionales (GET /users/:id/messages)

- **content**: Filtrar mensajes que contengan el texto especificado
- **after**: Filtrar mensajes creados después de la fecha especificada (ISO 8601)
- **limit**: Limitar el número de mensajes devueltos (mínimo 1)

## Formato de Respuestas

Todas las respuestas siguen el formato:
```json
{
  "success": boolean,
  "message": "string",
  "data": object | array | null
}
```

### Respuestas de Error
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## Base de Datos

### Modelos

**User**
- id: Int (Primary Key, Auto Increment)
- name: String
- email: String (Unique)
- messages: Message[]

**Message**
- id: Int (Primary Key, Auto Increment)
- content: String
- createdAt: DateTime (Default: now())
- userId: Int (Foreign Key)
- user: User (Relation)
