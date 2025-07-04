# 📚 Guía de Arquitectura - Selaski Backend

## 🎯 Resumen del Proyecto

API REST construida con **NestJS + Prisma + MySQL** que maneja usuarios y mensajes con relaciones 1:N.

---

## 🏗️ Arquitectura General

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │───▶│    Services     │───▶│   Prisma ORM    │
│  (HTTP Layer)   │    │ (Business Logic)│    │  (Data Layer)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   ┌──────────┐          ┌──────────────┐        ┌──────────────┐
   │   DTOs   │          │  Validation  │        │    MySQL     │
   │Validation│          │ & Error      │        │   Database   │
   └──────────┘          │  Handling    │        └──────────────┘
                         └──────────────┘
```

---

## 📁 Estructura de Archivos

```
src/
├── main.ts                 # 🚀 Punto de entrada + Swagger
├── app.module.ts           # 🏠 Módulo raíz
├── user/                   # 👤 Módulo de usuarios
│   ├── user.controller.ts  # 🎮 Endpoints HTTP
│   ├── user.service.ts     # 🧠 Lógica de negocio
│   ├── user.module.ts      # 📦 Configuración del módulo
│   └── dto/
│       └── create-user.dto.ts # ✅ Validaciones
├── message/                # 💬 Módulo de mensajes
│   ├── message.controller.ts
│   ├── message.service.ts
│   ├── message.module.ts
│   └── dto/
│       └── create-message.dto.ts
└── prisma/                 # 🗄️ Configuración de BD
    ├── prisma.service.ts   # 🔌 Cliente Prisma
    └── prisma.module.ts    # 📦 Módulo Prisma
```

---

## 🔄 Flujo de una Request

### 1. **POST /users** (Crear Usuario)
```
HTTP Request → UserController.create()
     ↓
CreateUserDto (validación automática)
     ↓
UserService.create()
     ↓
Prisma.user.create()
     ↓
MySQL Database
     ↓
Response JSON
```

### 2. **POST /messages** (Crear Mensaje)
```
HTTP Request → MessageController.create()
     ↓
CreateMessageDto (validación automática)
     ↓
MessageService.create()
     ↓
Validar usuario existe
     ↓
Prisma.message.create()
     ↓
MySQL Database
```

### 3. **GET /users/:id/messages** (Listar Mensajes)
```
HTTP Request → UserController.getMessages()
     ↓
QueryMessagesDto (filtros opcionales)
     ↓
Validar usuario existe
     ↓
UserService.getMessages()
     ↓
Prisma.message.findMany() (con filtros)
     ↓
ApiResponseDto (success, message, data)
```

---

## 🗄️ Modelo de Base de Datos

```sql
┌─────────────────┐         ┌─────────────────┐
│      User       │         │    Message      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────┤ id (PK)         │
│ name            │    1:N  │ content         │
│ email (UNIQUE)  │         │ createdAt       │
└─────────────────┘         │ userId (FK)     │
                            └─────────────────┘
```

**Relación:** Un usuario puede tener muchos mensajes

---

## 🎮 Controladores (Controllers)

### UserController
```typescript
@Controller('users')  // Ruta base: /users
export class UserController {
  
  @Post()  // POST /users
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return new ApiResponseDto(true, 'User created successfully', user);
  }

  @Get(':id/messages')  // GET /users/1/messages
  async getMessages(
    @Param('id') id: string,
    @Query() query: QueryMessagesDto
  ) {
    const messages = await this.userService.getMessages(Number(id), query);
    return new ApiResponseDto(true, 'Messages retrieved successfully', messages);
  }
}
```

### MessageController
```typescript
@Controller('messages')  // Ruta base: /messages
export class MessageController {
  
  @Post()  // POST /messages
  async create(@Body() dto: CreateMessageDto) {
    const message = await this.messageService.create(dto);
    return new ApiResponseDto(true, 'Message created successfully', message);
  }
}
```

---

## 🧠 Servicios (Business Logic)

### UserService
```typescript
@Injectable()
export class UserService {
  
  // Crear usuario con validación de email único
  async create(data: CreateUserDto) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {  // Prisma error code
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  // Listar mensajes con validación de usuario y filtros opcionales
  async getMessages(userId: number, filters?: { content?: string; after?: string; limit?: number }) {
    const userExists = await this.prisma.user.findUnique({ 
      where: { id: userId } 
    });
    
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    const where: any = { userId };
    if (filters?.content) {
      where.content = { contains: filters.content };
    }
    if (filters?.after) {
      where.createdAt = { gte: new Date(filters.after) };
    }

    return this.prisma.message.findMany({
      where,
      take: filters?.limit ? Number(filters.limit) : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

### MessageService
```typescript
@Injectable()
export class MessageService {
  
  // Crear mensaje con validación de usuario existente
  async create(data: CreateMessageDto) {
    const userExists = await this.prisma.user.findUnique({ 
      where: { id: data.userId } 
    });
    
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.message.create({ data });
  }
}
```

---

## ✅ DTOs y Validaciones

### CreateUserDto
```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsNotEmpty()  // No puede estar vacío
  name: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()     // Formato de email válido
  email: string;
}
```

### CreateMessageDto
```typescript
export class CreateMessageDto {
  @ApiProperty({ example: 'Hola mundo' })
  @IsNotEmpty()  // No puede estar vacío
  content: string;

  @ApiProperty({ example: 1 })
  @IsInt()       // Debe ser número entero
  userId: number;
}
```

### QueryMessagesDto
```typescript
export class QueryMessagesDto {
  @ApiPropertyOptional({ example: 'hola' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  after?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
```

### ApiResponseDto
```typescript
export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiProperty()
  data: T;
}
```

---

## 🔌 Prisma ORM

### Schema (prisma/schema.prisma)
```prisma
model User {
  id       Int       @id @default(autoincrement())
  name     String
  email    String    @unique
  messages Message[]  // Relación 1:N
}

model Message {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
}
```

### PrismaService
```typescript
@Injectable()
export class PrismaService extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy {
  
  async onModuleInit() {
    await this.$connect();    // Conectar al iniciar
  }

  async onModuleDestroy() {
    await this.$disconnect(); // Desconectar al cerrar
  }
}
```

---

## 🚀 Configuración Principal

### main.ts
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Validaciones globales
  app.useGlobalPipes(new ValidationPipe());
  
  // Filtro global para respuestas de error estructuradas
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Swagger documentation
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

### AppModule
```typescript
@Module({
  imports: [
    PrismaModule,    // Conexión a BD
    UserModule,      // Funcionalidad usuarios
    MessageModule,   // Funcionalidad mensajes
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 🔄 Inyección de Dependencias

```
AppModule
    ├── PrismaModule
    │   └── PrismaService (Singleton)
    ├── UserModule
    │   ├── UserController
    │   └── UserService ← PrismaService
    └── MessageModule
        ├── MessageController
        └── MessageService ← PrismaService
```

**NestJS automáticamente inyecta PrismaService en los servicios que lo necesitan.**

---

## 🛡️ Manejo de Errores

### Tipos de Errores
```typescript
// Email duplicado
ConflictException('Email already exists')     // 409

// Usuario no encontrado
NotFoundException('User not found')           // 404

// Validación fallida
BadRequestException('Validation failed')     // 400
```

### Códigos de Error Prisma
```typescript
// P2002: Unique constraint violation
if (error.code === 'P2002') {
  throw new ConflictException('Email already exists');
}
```

---

## 📊 Swagger Documentation

### Acceso
- **URL:** `http://localhost:3000/api`
- **Características:**
  - Documentación interactiva
  - Ejemplos de requests/responses
  - Pruebas directas desde el navegador

### Decoradores Importantes
```typescript
@ApiProperty({ example: 'valor ejemplo' })  // Documenta propiedades
@Controller('ruta')                          // Documenta controladores
@Post()                                      // Documenta endpoints
```

---

## 🧪 Testing del Proyecto

### Endpoints de Prueba

1. **Crear Usuario**
```bash
POST http://localhost:3000/users
{
  "name": "Juan Pérez",
  "email": "juan@example.com"
}
```

2. **Crear Mensaje**
```bash
POST http://localhost:3000/messages
{
  "content": "Hola mundo",
  "userId": 1
}
```

3. **Listar Mensajes**
```bash
GET http://localhost:3000/users/1/messages
```

---

## 🎯 Puntos Clave para Entrevista

### **Arquitectura**
- Separación clara de responsabilidades
- Inyección de dependencias automática
- Módulos bien organizados

### **Validaciones**
- DTOs con decoradores de class-validator
- Validación automática en requests
- Manejo específico de errores

### **Base de Datos**
- ORM moderno (Prisma)
- Migraciones versionadas
- Relaciones bien definidas

### **Documentación**
- Swagger automático
- Ejemplos claros
- API explorable

### **Buenas Prácticas**
- Async/await consistente
- Manejo de errores específicos
- Código limpio y mantenible

---

## 🚀 Comandos Importantes

```bash
# Desarrollo
pnpm run start:dev

# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate deploy

# Ver base de datos
npx prisma studio

# Tests
pnpm run test
```

---

## 🚀 Mejoras de Escalabilidad (No Implementadas)

### 📊 **Queue System - Manejo de Colas**

**Problema:** Peticiones pesadas pueden bloquear el servidor

**Solución:** Sistema de colas con **Bull/BullMQ**

```typescript
// Ejemplo conceptual - NO implementado
@Injectable()
export class MessageQueue {
  constructor(@InjectQueue('message') private messageQueue: Queue) {}

  async addMessageJob(data: CreateMessageDto) {
    await this.messageQueue.add('create-message', data, {
      delay: 0,
      attempts: 3,
      backoff: 'exponential'
    });
  }
}

@Processor('message')
export class MessageProcessor {
  @Process('create-message')
  async handleCreateMessage(job: Job<CreateMessageDto>) {
    // Procesar mensaje de forma asíncrona
    return await this.messageService.create(job.data);
  }
}
```

**Beneficios:**
- Peticiones no bloquean el servidor
- Procesamiento asíncrono
- Reintentos automáticos
- Escalabilidad horizontal

---

### 🔒 **Rate Limiting - Limitación de Peticiones**

**Problema:** Ataques DDoS y spam pueden saturar la API

**Solución:** Rate limiting con **@nestjs/throttler**

```typescript
// Ejemplo conceptual - NO implementado
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,     // 60 segundos
      limit: 100,  // 100 peticiones por minuto
    }),
  ],
})
export class AppModule {}

// En controladores
@Controller('users')
@UseGuards(ThrottlerGuard)
export class UserController {
  
  @Post()
  @Throttle(5, 60)  // 5 peticiones por minuto para crear usuarios
  async create(@Body() dto: CreateUserDto) {
    // ...
  }

  @Get(':id/messages')
  @Throttle(50, 60) // 50 peticiones por minuto para listar
  async getMessages() {
    // ...
  }
}
```

**Configuración Avanzada:**
```typescript
// Rate limiting por IP
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Request): string {
    return req.ip; // Limitar por IP
  }
}

// Rate limiting diferenciado
@Injectable()
export class TieredThrottlerGuard extends ThrottlerGuard {
  protected async getLimit(context: ExecutionContext): Promise<number> {
    const request = context.switchToHttp().getRequest();
    const userType = request.user?.type;
    
    // Usuarios premium: más peticiones
    return userType === 'premium' ? 1000 : 100;
  }
}
```

**Beneficios:**
- Protección contra ataques DDoS
- Prevención de spam
- Control de uso por IP
- Diferentes límites por endpoint

---

### 📈 **Implementación Recomendada**

**Para Queue System:**
```bash
npm install @nestjs/bull bull
npm install @types/bull --save-dev
```

**Para Rate Limiting:**
```bash
npm install @nestjs/throttler
```

**Configuración en main.ts:**
```typescript
// Redis para colas y rate limiting
app.useGlobalGuards(new ThrottlerGuard());
```

---

### 🎯 **Casos de Uso**

**Queue System:**
- Envío de emails
- Procesamiento de imágenes
- Generación de reportes
- Operaciones pesadas de BD

**Rate Limiting:**
- APIs públicas
- Endpoints de autenticación
- Operaciones costosas
- Protección general

---

**Este proyecto demuestra dominio completo del stack NestJS + Prisma + MySQL con arquitectura profesional, buenas prácticas, y conocimiento de mejoras de escalabilidad.**