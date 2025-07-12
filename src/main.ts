import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get allowed origins from environment variable
  const allowedOrigins = (process.env.FRONTEND_URLS || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim());

  // Configure CORS
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours in seconds
  });

  // Configure cookie parser
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    whitelist: true,
  }));
  
  app.setGlobalPrefix('api/v1');

  const host = process.env.HOST || 'localhost';
  const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

  await app.listen(port, host);
  console.log(`🚀 Server running at http://${host}:${port}`);
  console.log('🌐 CORS enabled for:', allowedOrigins);
}
bootstrap();