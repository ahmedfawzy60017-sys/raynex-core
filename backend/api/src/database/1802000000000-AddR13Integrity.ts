import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 1.2.0-dev.3 integrity pass:
 *  - drops the duplicate indexes created by 1801 (same columns as ix_catalog_parts_oem / ix_catalog_parts_system),
 *  - adds referential integrity for vehicles.brand_id / vehicles.model_id (NOT VALID so legacy rows cannot block the upgrade),
 *  - constrains vehicles.verification_status and audit lookups.
 */
export class AddR13Integrity1802000000000 implements MigrationInterface {
  name = 'AddR13Integrity1802000000000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS ix_parts_oem_number`);
    await q.query(`DROP INDEX IF EXISTS ix_parts_system_code`);
    await q.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vehicles_brand') THEN
        ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_brand FOREIGN KEY (brand_id) REFERENCES manufacturers(id) ON DELETE SET NULL NOT VALID;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vehicles_model') THEN
        ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_model FOREIGN KEY (model_id) REFERENCES vehicle_models(id) ON DELETE SET NULL NOT VALID;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_vehicles_verification_status') THEN
        ALTER TABLE vehicles ADD CONSTRAINT chk_vehicles_verification_status CHECK (verification_status IN ('unverified','partial','verified','disputed')) NOT VALID;
      END IF;
    END $$`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_audit_events_resource ON audit_events(resource_type, resource_id)`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_maintenance_vehicle ON maintenance_records(vehicle_id)`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_diagnostic_vehicle ON diagnostic_sessions(vehicle_id)`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS ix_diagnostic_vehicle`);
    await q.query(`DROP INDEX IF EXISTS ix_maintenance_vehicle`);
    await q.query(`DROP INDEX IF EXISTS ix_audit_events_resource`);
    await q.query(`ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS chk_vehicles_verification_status`);
    await q.query(`ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS fk_vehicles_model`);
    await q.query(`ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS fk_vehicles_brand`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_parts_oem_number ON catalog_parts(oem_number)`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_parts_system_code ON catalog_parts(system_code)`);
  }
}
