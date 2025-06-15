import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true, // or specify: ['http://localhost:3000']
      credentials: true,
    },
  });

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');

  const host = process.env.HOST || 'localhost';
  const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

  await app.listen(port, host);
  console.log(`🚀 Server running at http://${host}:${port}`);
}
bootstrap();