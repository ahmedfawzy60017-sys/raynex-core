import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './vehicles/vehicle.entity';
import { User } from './users.entity';
import { VehiclesModule } from './vehicles/vehicles.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { CatalogModule } from './catalog/catalog.module';
import { PlatformModule } from './platform/platform.module';
import { InspectionsModule } from './inspections/inspections.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { PartsModule } from './parts/parts.module';
import { AuditModule } from './audit/audit.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { APP_GUARD } from '@nestjs/core';
import { dbConnection, validateEnv } from './config/db';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        ...dbConnection({
          DB_HOST: config.get<string>('DB_HOST'), DB_PORT: config.get<string>('DB_PORT'), DB_USER: config.get<string>('DB_USER'),
          DB_PASSWORD: config.get<string>('DB_PASSWORD'), DB_NAME: config.get<string>('DB_NAME'), DB_SSL: config.get<string>('DB_SSL'),
          DB_SSL_REJECT_UNAUTHORIZED: config.get<string>('DB_SSL_REJECT_UNAUTHORIZED'), DB_POOL_MAX: config.get<string>('DB_POOL_MAX'),
        } as NodeJS.ProcessEnv),
        entities: [Vehicle, User],
        synchronize: false, migrationsRun: false, retryAttempts: 5, retryDelay: 3000,
      }),
    }),
    AuthModule, VehiclesModule, CatalogModule, PlatformModule, InspectionsModule, MaintenanceModule, DiagnosticsModule, PartsModule, AuditModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: RateLimitGuard }],
})
export class AppModule {}
