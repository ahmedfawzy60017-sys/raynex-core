import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { IsArray, IsIn, IsOptional, IsUUID, ArrayMaxSize, Matches, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DiagnosticsService } from './diagnostics.service';
class ManualDtcCodeDto {
  @IsString() @Matches(/^[PBCU][0-9A-F]{4}$/i) code!: string;
  @IsOptional() @IsIn(['user-entered']) source?: string;
}
class CreateDiagnosticDto {
  @IsUUID() vehicleId!: string;
  @IsIn(['manual']) source!: 'manual';
  @IsOptional() @IsArray() @ArrayMaxSize(100) @ValidateNested({ each: true }) @Type(() => ManualDtcCodeDto) dtcCodes?: ManualDtcCodeDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(20) evidence?: unknown[];
}
@Controller('diagnostic-sessions')
@UseGuards(JwtAuthGuard)
export class DiagnosticsController {
  constructor(private readonly diagnostics: DiagnosticsService) {}
  @Get() list(@CurrentUser() user: { id: string }) { return this.diagnostics.list(user.id); }
  @Get(':id') get(@CurrentUser() user: { id: string }, @Param('id', ParseUUIDPipe) id: string) { return this.diagnostics.get(user.id, id); }
  @Post() create(@CurrentUser() user: { id: string }, @Body() dto: CreateDiagnosticDto) { return this.diagnostics.create(user.id, dto); }
}
