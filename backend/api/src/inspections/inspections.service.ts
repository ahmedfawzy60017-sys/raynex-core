import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { DataSource } from 'typeorm';

@Injectable()
export class InspectionsService {
  constructor(private readonly db: DataSource, private readonly audit: AuditService) {}

  async list(ownerId: string, vehicleId?: string) {
    const params: unknown[] = [ownerId];
    let filter = '';
    if (vehicleId) { params.push(vehicleId); filter = ' AND vehicle_id = $2'; }
    const rows = await this.db.query(
      `SELECT id, vehicle_id AS "vehicleId", inspection_type AS "inspectionType", status,
       overall_condition AS "overallCondition", findings, evidence, report_locale AS "reportLocale",
       inspector_name AS "inspectorName", inspected_at AS "inspectedAt", created_at AS "createdAt"
       FROM inspections WHERE owner_user_id = $1${filter} ORDER BY created_at DESC LIMIT 100`, params);
    return { data: rows };
  }

  async create(ownerId: string, dto: {
    vehicleId: string; inspectionType: string; reportLocale?: string;
    findings?: unknown[]; evidence?: unknown[]; inspectorName?: string;
  }) {
    return this.db.transaction(async (m) => {
      // FOR SHARE keeps the vehicle from being soft-deleted by a concurrent request while the inspection is inserted.
      const owned = await m.query('SELECT id FROM vehicles WHERE id = $1 AND owner_user_id = $2 AND is_deleted = false FOR SHARE', [dto.vehicleId, ownerId]);
      if (!owned.length) throw new NotFoundException('VEHICLE_NOT_FOUND');
      const rows = await m.query(
        `INSERT INTO inspections (owner_user_id, vehicle_id, inspection_type, report_locale, findings, evidence, inspector_name)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7)
         RETURNING id, vehicle_id AS "vehicleId", inspection_type AS "inspectionType", status,
         report_locale AS "reportLocale", findings, evidence, inspector_name AS "inspectorName", created_at AS "createdAt"`,
        [ownerId, dto.vehicleId, dto.inspectionType, dto.reportLocale ?? 'en',
         JSON.stringify(dto.findings ?? []), JSON.stringify(dto.evidence ?? []), dto.inspectorName?.trim() || null]);
      await this.audit.record({ actorUserId: ownerId, action: 'inspection.created', resourceType: 'inspection', resourceId: rows[0].id }, m);
      return rows[0];
    });
  }
}
