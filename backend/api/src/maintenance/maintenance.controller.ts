import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto/maintenance.dto';
import { MaintenanceService } from './maintenance.service';

@Controller('maintenance-records')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private readonly maintenance: MaintenanceService) {}
  @Get() list(@CurrentUser() user: { id: string }, @Query('vehicleId', new ParseUUIDPipe({ optional: true })) vehicleId?: string) { return this.maintenance.list(user.id, vehicleId); }
  @Post() create(@CurrentUser() user: { id: string }, @Body() dto: CreateMaintenanceDto) { return this.maintenance.create(user.id, dto); }
  @Patch(':id') update(@CurrentUser() user: { id: string }, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMaintenanceDto) { return this.maintenance.update(user.id, id, dto); }
  @Delete(':id') remove(@CurrentUser() user: { id: string }, @Param('id', ParseUUIDPipe) id: string) { return this.maintenance.remove(user.id, id); }
}
