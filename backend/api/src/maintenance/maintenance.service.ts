import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { AuditService } from '../audit/audit.service';

const COLUMNS = `id, vehicle_id AS "vehicleId", category, title, description, performed_at AS "performedAt", odometer_km AS "odometerKm", cost_amount AS "costAmount", currency, workshop_name AS "workshopName", created_at AS "createdAt"`;

type MaintenanceInput = { vehicleId?: string; category?: string; title?: string; description?: string; performedAt?: string; odometerKm?: number; costAmount?: number; currency?: string; workshopName?: string };

@Injectable()
export class MaintenanceService {
  constructor(private readonly db: DataSource, private readonly audit: AuditService) {}

  async list(ownerId: string, vehicleId?: string) {
    const params: unknown[] = [ownerId]; let filter = '';
    if (vehicleId) { params.push(vehicleId); filter = ' AND vehicle_id = $2'; }
    return { data: await this.db.query(`SELECT ${COLUMNS}, parts_used AS "partsUsed", attachments FROM maintenance_records WHERE owner_user_id = $1${filter} ORDER BY performed_at DESC, id DESC LIMIT 200`, params) };
  }

  private async assertVehicle(m: EntityManager, ownerId: string, vehicleId: string) {
    const owned = await m.query('SELECT id FROM vehicles WHERE id = $1 AND owner_user_id = $2 AND is_deleted = false FOR SHARE', [vehicleId, ownerId]);
    if (!owned.length) throw new NotFoundException('VEHICLE_NOT_FOUND');
  }

  /** Rejects impossible calendar dates (e.g. 2026-02-30, which the ISO regex accepts) and future dates. */
  private validateDate(value?: string) {
    if (value === undefined) return;
    const time = new Date(value).getTime();
    if (Number.isNaN(time)) throw new BadRequestException('PERFORMED_AT_INVALID');
    // One day of slack so a user whose local date is ahead of UTC can still record "today".
    if (time > Date.now() + 24 * 60 * 60 * 1000) throw new BadRequestException('PERFORMED_AT_CANNOT_BE_FUTURE');
  }

  async create(ownerId: string, dto: MaintenanceInput & { vehicleId: string; category: string; title: string; performedAt: string }) {
    this.validateDate(dto.performedAt);
    return this.db.transaction(async (m) => {
      await this.assertVehicle(m, ownerId, dto.vehicleId);
      const rows = await m.query(
        `INSERT INTO maintenance_records (owner_user_id, vehicle_id, category, title, description, performed_at, odometer_km, cost_amount, currency, workshop_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING ${COLUMNS}`,
        [ownerId, dto.vehicleId, dto.category, dto.title, dto.description ?? null, dto.performedAt, dto.odometerKm ?? null, dto.costAmount ?? null, dto.currency ?? null, dto.workshopName ?? null]);
      await this.audit.record({ actorUserId: ownerId, action: 'maintenance.created', resourceType: 'maintenance_record', resourceId: rows[0].id }, m);
      return rows[0];
    });
  }

  async update(ownerId: string, id: string, dto: MaintenanceInput) {
    this.validateDate(dto.performedAt);
    return this.db.transaction(async (m) => {
      const current = await m.query('SELECT id, vehicle_id FROM maintenance_records WHERE id = $1 AND owner_user_id = $2 FOR UPDATE', [id, ownerId]);
      if (!current.length) throw new NotFoundException('MAINTENANCE_RECORD_NOT_FOUND');
      await this.assertVehicle(m, ownerId, dto.vehicleId ?? current[0].vehicle_id);
      const fields: [string, unknown][] = [['vehicle_id', dto.vehicleId], ['category', dto.category], ['title', dto.title], ['description', dto.description], ['performed_at', dto.performedAt], ['odometer_km', dto.odometerKm], ['cost_amount', dto.costAmount], ['currency', dto.currency], ['workshop_name', dto.workshopName]];
      const sets: string[] = []; const params: unknown[] = [id, ownerId];
      for (const [column, value] of fields) if (value !== undefined) { params.push(value); sets.push(`${column} = $${params.length}`); }
      if (sets.length) { sets.push('updated_at = now()'); await m.query(`UPDATE maintenance_records SET ${sets.join(', ')} WHERE id = $1 AND owner_user_id = $2`, params); }
      await this.audit.record({ actorUserId: ownerId, action: 'maintenance.updated', resourceType: 'maintenance_record', resourceId: id }, m);
      const rows = await m.query(`SELECT ${COLUMNS} FROM maintenance_records WHERE id = $1 AND owner_user_id = $2`, [id, ownerId]);
      return rows[0];
    });
  }

  async remove(ownerId: string, id: string) {
    return this.db.transaction(async (m) => {
      const result = await m.query('DELETE FROM maintenance_records WHERE id = $1 AND owner_user_id = $2 RETURNING id', [id, ownerId]);
      if (!result.length) throw new NotFoundException('MAINTENANCE_RECORD_NOT_FOUND');
      await this.audit.record({ actorUserId: ownerId, action: 'maintenance.deleted', resourceType: 'maintenance_record', resourceId: id }, m);
      return { id, deleted: true };
    });
  }
}
