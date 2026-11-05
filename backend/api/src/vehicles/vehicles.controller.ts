import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}
  @Post() create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateVehicleDto) { return this.service.create(user.id, dto); }
  @Get() findAll(@CurrentUser() user: AuthenticatedUser, @Query('page') page = '1', @Query('limit') limit = '20') { return this.service.findAll(user.id, Math.max(1, Number(page) || 1), Math.min(100, Math.max(1, Number(limit) || 20))); }
  @Get(':id') findOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id, user.id); }
  @Patch(':id') update(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateVehicleDto) { return this.service.update(id, user.id, dto); }
  @Delete(':id') remove(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id, user.id); }
}
