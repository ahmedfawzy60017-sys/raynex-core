import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';

@Module({ imports: [AuthModule], controllers: [DiagnosticsController], providers: [DiagnosticsService] })
export class DiagnosticsModule {}
