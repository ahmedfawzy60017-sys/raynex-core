import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}
  @Get('vehicle-classes') vehicleClasses() { return this.catalog.vehicleClasses(); }
  @Get('powertrains') powertrains() { return this.catalog.powertrains(); }
  @Get('coverage') coverage(@Query('class') vehicleClass?: string) { return this.catalog.coverage(vehicleClass); }
}
