import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RAYNEX_VERSION } from '../version';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DataSource) {}

  /** Liveness: the process is up. Does not touch the database. */
  @Get('live') live() { return { status: 'ok', version: RAYNEX_VERSION }; }

  /** Readiness: the database answers. Returns 503 (not 500) when it does not. */
  @Get() async check() {
    try { await this.db.query('SELECT 1'); }
    catch { throw new ServiceUnavailableException({ status: 'unavailable', database: 'down' }); }
    return { status: 'ok', database: 'ok', version: RAYNEX_VERSION, timestamp: new Date().toISOString() };
  }
}
