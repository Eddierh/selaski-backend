import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  
  const config = new DocumentBuilder()
    .setTitle('Selaski API')
    .setDescription('API REST para manejo de usuarios y mensajes')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  logRoutes(app);

  await app.listen(port);
  console.log(`🚀 Server running on: http://localhost:${port}/`);
}

function logRoutes(app) {
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();

  if (instance._router) {
    const routes = instance._router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        method: Object.keys(layer.route.methods).join(', ').toUpperCase(),
        path: layer.route.path,
      }));

    console.log('🚦 Registered Routes:');
    console.table(routes);
  } else {
    console.log('⚠️ No router stack found. Are you using Fastify? This works only with Express.');
  }
}

bootstrap();
