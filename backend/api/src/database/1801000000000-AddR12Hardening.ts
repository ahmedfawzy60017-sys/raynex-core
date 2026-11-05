import { MigrationInterface, QueryRunner } from 'typeorm';
export class AddR12Hardening1801000000000 implements MigrationInterface {
  name = 'AddR12Hardening1801000000000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_vehicles_owner_active ON vehicles(owner_user_id, created_at DESC) WHERE is_deleted = false`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_parts_oem_number ON catalog_parts(oem_number)`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_parts_system_code ON catalog_parts(system_code)`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP INDEX IF EXISTS ix_parts_oem_number`);
    await q.query(`DROP INDEX IF EXISTS ix_parts_system_code`);
    await q.query(`DROP INDEX IF EXISTS ix_vehicles_owner_active`);
    await q.query(`ALTER TABLE vehicles DROP COLUMN IF EXISTS is_deleted`);
  }
}
