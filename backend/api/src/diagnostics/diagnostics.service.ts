import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditService } from '../audit/audit.service';

const COLUMNS = `id, vehicle_id AS "vehicleId", source, adapter_metadata AS "adapterMetadata", dtc_codes AS "dtcCodes", telemetry, hypotheses, evidence, status, created_at AS "createdAt"`;

@Injectable()
export class DiagnosticsService {
  constructor(private readonly db: DataSource, private readonly audit: AuditService) {}
  async list(ownerId: string) {
    return { data: await this.db.query(`SELECT ${COLUMNS} FROM diagnostic_sessions WHERE owner_user_id = $1 ORDER BY created_at DESC LIMIT 100`, [ownerId]) };
  }
  async get(ownerId: string, id: string) {
    const rows = await this.db.query(`SELECT ${COLUMNS} FROM diagnostic_sessions WHERE id = $1 AND owner_user_id = $2`, [id, ownerId]);
    if (!rows.length) throw new NotFoundException('DIAGNOSTIC_SESSION_NOT_FOUND');
    return rows[0];
  }
  /** Upper-case and de-duplicate user-entered codes so "p0300" and "P0300" are one entry. */
  private normalizeCodes(codes?: unknown[]): unknown[] {
    const seen = new Set<string>(); const out: unknown[] = [];
    for (const item of codes ?? []) {
      const raw = (item as { code?: unknown })?.code;
      if (typeof raw !== 'string') { out.push(item); continue; }
      const code = raw.trim().toUpperCase();
      if (seen.has(code)) continue;
      seen.add(code); out.push({ ...(item as object), code });
    }
    return out;
  }
  async create(ownerId: string, dto: { vehicleId: string; source: 'manual'; dtcCodes?: unknown[]; evidence?: unknown[] }) {
    if (dto.source !== 'manual') throw new BadRequestException('DIAGNOSTIC_SOURCE_NOT_AVAILABLE');
    return this.db.transaction(async (m) => {
      const owned = await m.query('SELECT id FROM vehicles WHERE id = $1 AND owner_user_id = $2 AND is_deleted = false FOR SHARE', [dto.vehicleId, ownerId]);
      if (!owned.length) throw new NotFoundException('VEHICLE_NOT_FOUND');
      const rows = await m.query(
        `INSERT INTO diagnostic_sessions (owner_user_id, vehicle_id, source, adapter_metadata, dtc_codes, telemetry, hypotheses, evidence) VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7::jsonb,$8::jsonb) RETURNING ${COLUMNS}`,
        [ownerId, dto.vehicleId, dto.source, JSON.stringify({}), JSON.stringify(this.normalizeCodes(dto.dtcCodes)), JSON.stringify({}), JSON.stringify([]), JSON.stringify(dto.evidence ?? [])]);
      await this.audit.record({ actorUserId: ownerId, action: 'diagnostic.manual_recorded', resourceType: 'diagnostic_session', resourceId: rows[0].id, metadata: { source: 'manual' } }, m);
      return rows[0];
    });
  }
}
