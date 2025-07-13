import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get allowed origins from environment variable
  const allowedOrigins = (process.env.FRONTEND_URLS || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin);

  console.log('🌐 Allowed Origins:', allowedOrigins);

  // Simplified CORS config
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    whitelist: true,
  }));
  
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`🚀 Server running on port ${port}`);
  console.log('🌐 CORS enabled for:', allowedOrigins);
}
bootstrap();