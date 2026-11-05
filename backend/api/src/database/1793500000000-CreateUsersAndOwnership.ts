import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAndOwnership1793500000000 implements MigrationInterface {
  name = 'CreateUsersAndOwnership1793500000000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email varchar(254) NOT NULL,
      password_hash varchar(255) NOT NULL,
      display_name varchar(120),
      status varchar(24) NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','pending')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users (lower(email))`);
    await q.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vehicles_owner_user') THEN
        ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_owner_user FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE RESTRICT NOT VALID;
      END IF;
    END $$`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS fk_vehicles_owner_user`);
    await q.query(`DROP TABLE IF EXISTS users`);
  }
}
