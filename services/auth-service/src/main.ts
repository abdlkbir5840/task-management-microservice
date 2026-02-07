import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RabbitMQService } from './messaging/abbitmq.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT') || 3001
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  await app.listen(port);
  Logger.log(`Auth Service running on port ${port}`);
  // AFTER app initialization
const rabbit = app.get(RabbitMQService);

await rabbit.emit('auth.test', { ok: true });
}
bootstrap();
