import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3005);
  console.log('Tasks Edit Mirror Service running on http://localhost:3005');
}
bootstrap();
