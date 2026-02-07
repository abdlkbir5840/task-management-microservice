import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { PasswordService } from './security/password.service';
import { JwtService } from './security/jwt.service';
import { RabbitMQService } from './messaging/abbitmq.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, PasswordService, JwtService, RabbitMQService],
  exports: [PasswordService, JwtService, RabbitMQService]
})
export class AppModule {}
