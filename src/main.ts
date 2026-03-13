import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3009); // Было 3000, теперь 3001
  console.log('Сервер запущен на http://localhost:3009');
}
bootstrap();