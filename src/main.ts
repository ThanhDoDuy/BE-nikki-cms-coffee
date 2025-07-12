import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Simplified CORS since Nginx handles it
  app.enableCors({
    origin: true,
    credentials: true
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

  const host = process.env.HOST || 'localhost';
  const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

  await app.listen(port, host);
  console.log(`🚀 Server running at http://${host}:${port}`);
}
bootstrap();