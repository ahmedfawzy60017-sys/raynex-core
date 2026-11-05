import { Controller, Get, Query } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PartsService } from './parts.service';

export class PartsQuery {
  @IsOptional() @IsString() @MaxLength(120) q?: string;
  @IsOptional() @IsString() @MaxLength(80) system?: string;
  @IsOptional() @IsString() @MaxLength(120) oem?: string;
}

@Controller('parts')
export class PartsController {
  constructor(private readonly parts: PartsService) {}
  @Get() search(@Query() query: PartsQuery) { return this.parts.search(query); }
}
