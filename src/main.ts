import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend access
  app.enableCors();

  // ✅ Serve static files from /uploads
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  await app.listen(process.env.PORT || 3000); // fallback to port 3000
}
bootstrap();
