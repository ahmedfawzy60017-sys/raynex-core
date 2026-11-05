import { Controller, Get } from '@nestjs/common';
import { PlatformService } from './platform.service';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platform: PlatformService) {}

  @Get('capabilities') capabilities() { return this.platform.capabilities(); }
  @Get('modules') modules() { return this.platform.modules(); }
}
