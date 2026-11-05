import { Body, Controller, Get, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { InspectionsService } from './inspections.service';

@Controller('inspections')
@UseGuards(JwtAuthGuard)
export class InspectionsController {
  constructor(private readonly inspections: InspectionsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }, @Query('vehicleId', new ParseUUIDPipe({ optional: true })) vehicleId?: string) {
    return this.inspections.list(user.id, vehicleId);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateInspectionDto) {
    return this.inspections.create(user.id, dto);
  }
}
