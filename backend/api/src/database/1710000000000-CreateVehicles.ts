import { MigrationInterface, QueryRunner } from 'typeorm';
export class CreateVehicles1710000000000 implements MigrationInterface {
  name = 'CreateVehicles1710000000000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    await q.query(`CREATE TABLE IF NOT EXISTS vehicles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_user_id uuid NOT NULL, brand_id uuid NULL, model_id uuid NULL, model_year smallint NULL CHECK (model_year IS NULL OR model_year BETWEEN 1886 AND 2100), market_code varchar(8) NULL, nickname varchar(80) NULL, vin_hash varchar(128) NULL, verification_status varchar(32) NOT NULL DEFAULT 'unverified', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`);
    await q.query(`CREATE INDEX IF NOT EXISTS idx_vehicles_owner_created ON vehicles(owner_user_id, created_at DESC)`);
  }
  async down(q: QueryRunner): Promise<void> { await q.query(`DROP TABLE IF EXISTS vehicles`); }
}
