import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { PasswordService } from './security/password.service';
import { JwtService } from './security/jwt.service';
import { RabbitMQService } from './messaging/abbitmq.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { SessionService } from './sessions/session.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>({
        secret: configService.get<string>('JWT_SECRET'),
      })
    }),
    PrismaModule
  ],
  controllers: [AppController, HealthController, AuthController],
  providers: [AppService, PasswordService, JwtService, RabbitMQService, SessionService, AuthService],
  exports: [PasswordService, JwtService, RabbitMQService]
})
export class AppModule {}
