# 🎬 Demo Script - Selaski Backend

## 🎯 Guión para Presentar el Proyecto

### **Introducción (30 segundos)**
> "He desarrollado una API REST con NestJS y Prisma que maneja usuarios y mensajes. Voy a mostrar la arquitectura, funcionalidades y características técnicas."

---

## 🚀 **1. Mostrar la Estructura del Proyecto**

```bash
# Mostrar estructura
tree src/
```

**Explicar:**
- "Arquitectura modular con separación clara de responsabilidades"
- "Cada entidad tiene su módulo independiente"
- "DTOs para validaciones, servicios para lógica de negocio"

---

## 🗄️ **2. Explicar el Modelo de Datos**

```bash
# Mostrar schema
cat prisma/schema.prisma
```

**Puntos clave:**
- "Relación 1:N entre User y Message"
- "Email único para usuarios"
- "Timestamps automáticos en mensajes"
- "Foreign key con integridad referencial"

---

## 🎮 **3. Demostrar los Endpoints**

### Iniciar el servidor
```bash
pnpm run start:dev
```

### A. Crear Usuario
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }'
```

**Explicar:**
- "Validación automática de email"
- "Respuesta con ID generado"

### B. Intentar Email Duplicado
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana García",
    "email": "juan@example.com"
  }'
```

**Mostrar:**
- "Error 409 - Email already exists"
- "Manejo específico de errores de Prisma"

### C. Crear Mensaje
```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hola mundo desde la API",
    "userId": 1
  }'
```

### D. Crear Mensaje con Usuario Inexistente
```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Mensaje de prueba",
    "userId": 999
  }'
```

**Mostrar:**
- "Error 404 - User not found"
- "Validación de integridad referencial"

### E. Listar Mensajes
```bash
curl http://localhost:3000/users/1/messages
```

**Mostrar respuesta estructurada:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": [
    {
      "id": 1,
      "content": "Hola mundo desde la API",
      "userId": 1,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### F. Listar Mensajes con Filtros
```bash
curl "http://localhost:3000/users/1/messages?content=hola&limit=5"
```

**Explicar:**
- "Filtros opcionales: content, after, limit"
- "Documentados en Swagger"
- "Validación automática de parámetros"

### G. Usuario Inexistente
```bash
curl http://localhost:3000/users/999/messages
```

**Mostrar respuesta de error estructurada:**
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

**Explicar:**
- "Error 404 con formato consistente"
- "Filtro global maneja todas las excepciones"

---

## 📚 **4. Mostrar Documentación Swagger**

```bash
# Abrir en navegador
http://localhost:3000/api
```

**Demostrar:**
- "Documentación automática generada"
- "Ejemplos interactivos"
- "Posibilidad de probar endpoints directamente"

---

## 🔍 **5. Explicar Validaciones**

### Mostrar DTOs
```typescript
// src/user/dto/create-user.dto.ts
export class CreateUserDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email: string;
}
```

**Puntos clave:**
- "class-validator para validaciones automáticas"
- "Decoradores Swagger para documentación"
- "ValidationPipe global en main.ts"

---

## 🧠 **6. Explicar Lógica de Negocio**

### Mostrar UserService
```typescript
async create(data: CreateUserDto) {
  try {
    return await this.prisma.user.create({ data });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictException('Email already exists');
    }
    throw error;
  }
}

async getMessages(userId: number) {
  const userExists = await this.prisma.user.findUnique({ 
    where: { id: userId } 
  });
  
  if (!userExists) {
    throw new NotFoundException('User not found');
  }

  return this.prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}
```

**Explicar:**
- "Manejo específico de errores de Prisma"
- "Conversión a excepciones HTTP apropiadas"
- "Validación de usuario antes de buscar mensajes"
- "Async/await para operaciones de BD"

---

## 🔧 **7. Mostrar Configuración**

### main.ts
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Selaski API')
    .setDescription('API REST para manejo de usuarios y mensajes')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
```

**Puntos clave:**
- "ValidationPipe global para todas las rutas"
- "Configuración centralizada de Swagger"
- "Bootstrap limpio y organizado"

---

## 🧪 **8. Demostrar Casos Edge**

### Validación de Datos
```bash
# Email inválido
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "invalid-email"}'

# Campo vacío
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "", "userId": 1}'

# UserId no numérico
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "Test", "userId": "abc"}'
```

**Mostrar:**
- "Validaciones automáticas funcionando"
- "Mensajes de error claros y específicos"

---

## 📊 **9. Mostrar Base de Datos**

```bash
# Abrir Prisma Studio
npx prisma studio
```

**Demostrar:**
- "Datos almacenados correctamente"
- "Relaciones funcionando"
- "Interface visual de la BD"

---

## 🎯 **10. Preguntas Frecuentes de Entrevista**

### **P: ¿Por qué NestJS?**
**R:** "Framework maduro con arquitectura modular, inyección de dependencias automática, y ecosistema robusto. Ideal para APIs escalables."

### **P: ¿Por qué Prisma?**
**R:** "ORM type-safe, migraciones automáticas, excelente DX con autocompletado, y soporte nativo para TypeScript."

### **P: ¿Cómo manejas los errores?**
**R:** "Capturo errores específicos de Prisma y los convierto en excepciones HTTP apropiadas. Uso códigos de error estándar."

### **P: ¿Cómo aseguras la calidad del código?**
**R:** "DTOs con validaciones, manejo de errores específicos, documentación automática, y arquitectura modular."

### **P: ¿Cómo escalarías esta API?**
**R:** "Implementaría queue system para peticiones, rate limiting por IP, caché con Redis, paginación, logging estructurado, y separación en microservicios si es necesario."

### **P: ¿Qué mejoras de rendimiento implementarías?**
**R:** "Queue system con Bull/BullMQ para encolar peticiones pesadas y evitar bloqueos. Rate limiting con @nestjs/throttler para prevenir ataques DDoS limitando peticiones por IP/segundo."

### **P: ¿Cómo manejarías alta concurrencia?**
**R:** "Queue system permite procesar peticiones de forma asíncrona sin saturar el servidor. Rate limiting protege contra spam y ataques, manteniendo la API estable bajo carga alta."

### **P: ¿Por qué validar usuario antes de buscar mensajes?**
**R:** "Para dar feedback claro al cliente. Sin validación, devolvería array vacío para usuarios inexistentes, lo cual es confuso."

### **P: ¿Por qué usar respuestas estructuradas?**
**R:** "Consistencia en toda la API. El cliente siempre sabe qué esperar: success, message y data. Facilita el manejo de errores y éxitos."

### **P: ¿Cómo manejas los filtros opcionales?**
**R:** "Uso DTOs con @IsOptional y construyo el objeto where dinámicamente. Solo agrego filtros que tienen valor, evitando undefined en Prisma."

---

## ⏱️ **Timing de la Demo (Total: 10-15 min)**

1. **Estructura y Arquitectura** - 2 min
2. **Modelo de Datos** - 1 min  
3. **Demo de Endpoints** - 6 min
4. **Swagger Documentation** - 2 min
5. **Código y Validaciones** - 2 min
6. **Preguntas** - 2-5 min

---

## 💡 **Tips para la Presentación**

### **Antes de Empezar:**
- Tener la BD corriendo
- Terminal preparado con comandos
- Navegador con Swagger abierto
- Postman/curl listo para pruebas

### **Durante la Demo:**
- Explicar el "por qué" de cada decisión técnica
- Mostrar tanto casos exitosos como errores
- Destacar buenas prácticas implementadas
- Mantener confianza y fluidez

### **Puntos a Destacar:**
- Arquitectura profesional y escalable
- Respuestas estructuradas consistentes
- Manejo robusto de errores con filtro global
- Documentación automática con Swagger
- Filtros opcionales bien documentados
- Validaciones comprehensivas
- Código limpio y mantenible

---

## 🚀 **Comandos de Respaldo**

```bash
# Si algo falla, reiniciar rápido
pnpm run start:dev

# Verificar BD
npx prisma studio

# Limpiar y reinstalar
rm -rf node_modules && pnpm install

# Regenerar Prisma
npx prisma generate

# Crear algunos datos de prueba rápido
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name": "Test User", "email": "test@example.com"}'
curl -X POST http://localhost:3000/messages -H "Content-Type: application/json" -d '{"content": "Test message", "userId": 1}'
```

---

## 📋 **Checklist Pre-Demo**

- [ ] Servidor corriendo en puerto 3000
- [ ] Base de datos MySQL conectada
- [ ] Al menos 1 usuario creado
- [ ] Al menos 1 mensaje creado
- [ ] Swagger accesible en /api
- [ ] Comandos curl preparados
- [ ] Terminal limpio y listo

---

**¡Con esta demo demuestras dominio completo del stack y capacidad para desarrollar APIs production-ready con endpoints simples pero robustos!**