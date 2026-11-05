import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User]), JwtModule.registerAsync({
    imports: [ConfigModule], inject: [ConfigService],
    useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'), signOptions: { expiresIn: '15m' } }),
  })],
  controllers: [AuthController], providers: [AuthService, UsersService, JwtAuthGuard],
  exports: [UsersService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
