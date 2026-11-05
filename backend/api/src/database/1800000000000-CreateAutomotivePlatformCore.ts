import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Normalized global automotive catalog + user-owned operational records.
 * Global catalog rows are source-attributed; user data is owner-scoped.
 * This migration intentionally creates no fabricated vehicle/part fitment data.
 */
export class CreateAutomotivePlatformCore1800000000000 implements MigrationInterface {
  name = 'CreateAutomotivePlatformCore1800000000000';

  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE IF NOT EXISTS data_sources (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      source_key varchar(100) NOT NULL UNIQUE,
      name varchar(200) NOT NULL,
      publisher varchar(200),
      source_url text,
      license_name varchar(160),
      license_url text,
      permitted_uses jsonb NOT NULL DEFAULT '[]'::jsonb,
      attribution_required boolean NOT NULL DEFAULT true,
      status varchar(24) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','disabled')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);

    await q.query(`CREATE TABLE IF NOT EXISTS manufacturers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      canonical_key varchar(160) NOT NULL UNIQUE,
      name varchar(200) NOT NULL,
      country_code char(2),
      website text,
      source_id uuid REFERENCES data_sources(id) ON DELETE RESTRICT,
      source_record_id varchar(200),
      verification_status varchar(24) NOT NULL DEFAULT 'unverified'
        CHECK (verification_status IN ('unverified','partial','verified','disputed')),
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);

    await q.query(`CREATE TABLE IF NOT EXISTS vehicle_models (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      manufacturer_id uuid NOT NULL REFERENCES manufacturers(id) ON DELETE RESTRICT,
      canonical_key varchar(220) NOT NULL UNIQUE,
      name varchar(200) NOT NULL,
      vehicle_class varchar(60) NOT NULL,
      production_start_year smallint,
      production_end_year smallint,
      source_id uuid REFERENCES data_sources(id) ON DELETE RESTRICT,
      source_record_id varchar(200),
      verification_status varchar(24) NOT NULL DEFAULT 'unverified'
        CHECK (verification_status IN ('unverified','partial','verified','disputed')),
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_vehicle_models_manufacturer ON vehicle_models(manufacturer_id)`);

    await q.query(`CREATE TABLE IF NOT EXISTS vehicle_variants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      model_id uuid NOT NULL REFERENCES vehicle_models(id) ON DELETE RESTRICT,
      canonical_key varchar(260) NOT NULL UNIQUE,
      generation varchar(100),
      model_year smallint,
      market_code varchar(8),
      trim_name varchar(120),
      powertrain varchar(40),
      engine_code varchar(100),
      motor_code varchar(100),
      transmission_code varchar(100),
      drivetrain varchar(40),
      source_id uuid REFERENCES data_sources(id) ON DELETE RESTRICT,
      source_record_id varchar(200),
      verification_status varchar(24) NOT NULL DEFAULT 'unverified'
        CHECK (verification_status IN ('unverified','partial','verified','disputed')),
      specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_vehicle_variants_lookup ON vehicle_variants(model_id, model_year, market_code)`);

    await q.query(`CREATE TABLE IF NOT EXISTS catalog_parts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      canonical_key varchar(240) NOT NULL UNIQUE,
      parent_part_id uuid REFERENCES catalog_parts(id) ON DELETE RESTRICT,
      system_code varchar(80) NOT NULL,
      name_en varchar(240) NOT NULL,
      name_ar varchar(240),
      description_en text,
      description_ar text,
      oem_number varchar(120),
      manufacturer_id uuid REFERENCES manufacturers(id) ON DELETE RESTRICT,
      source_id uuid REFERENCES data_sources(id) ON DELETE RESTRICT,
      source_record_id varchar(200),
      verification_status varchar(24) NOT NULL DEFAULT 'unverified'
        CHECK (verification_status IN ('unverified','partial','verified','disputed')),
      specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_catalog_parts_oem ON catalog_parts(oem_number)`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_catalog_parts_system ON catalog_parts(system_code)`);

    await q.query(`CREATE TABLE IF NOT EXISTS part_fitments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      part_id uuid NOT NULL REFERENCES catalog_parts(id) ON DELETE CASCADE,
      variant_id uuid NOT NULL REFERENCES vehicle_variants(id) ON DELETE RESTRICT,
      fitment_status varchar(24) NOT NULL CHECK (fitment_status IN ('confirmed','conditional','excluded','unknown')),
      notes text,
      source_id uuid REFERENCES data_sources(id) ON DELETE RESTRICT,
      source_record_id varchar(200),
      verified_at timestamptz,
      UNIQUE(part_id, variant_id, source_id)
    )`);

    await q.query(`CREATE TABLE IF NOT EXISTS three_d_assets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_key varchar(220) NOT NULL UNIQUE,
      variant_id uuid REFERENCES vehicle_variants(id) ON DELETE RESTRICT,
      title varchar(240) NOT NULL,
      format varchar(20) NOT NULL CHECK (format IN ('glb','gltf','obj','fbx','step','iges','other')),
      storage_uri text,
      fidelity varchar(32) NOT NULL CHECK (fidelity IN ('exact-variant-verified','partial','generic-illustrative','unavailable')),
      license_id uuid REFERENCES data_sources(id) ON DELETE RESTRICT,
      source_record_id varchar(200),
      manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
      status varchar(24) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','qa','published','withdrawn')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);

    await q.query(`CREATE TABLE IF NOT EXISTS inspections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
      inspection_type varchar(32) NOT NULL CHECK (inspection_type IN ('pre_purchase','post_accident','post_repair','periodic','comprehensive','obd')),
      status varchar(24) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_progress','completed','review_required','cancelled')),
      overall_condition varchar(24) CHECK (overall_condition IN ('excellent','good','fair','poor','unsafe','unknown')),
      findings jsonb NOT NULL DEFAULT '[]'::jsonb,
      evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
      report_locale varchar(8) NOT NULL DEFAULT 'en',
      inspector_name varchar(160),
      inspected_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_inspections_owner_created ON inspections(owner_user_id, created_at DESC)`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_inspections_vehicle ON inspections(vehicle_id)`);

    await q.query(`CREATE TABLE IF NOT EXISTS maintenance_records (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
      category varchar(80) NOT NULL,
      title varchar(200) NOT NULL,
      description text,
      performed_at timestamptz NOT NULL,
      odometer_km numeric(12,1),
      cost_amount numeric(12,2),
      currency char(3),
      workshop_name varchar(180),
      parts_used jsonb NOT NULL DEFAULT '[]'::jsonb,
      attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_maintenance_owner_vehicle_date ON maintenance_records(owner_user_id, vehicle_id, performed_at DESC)`);

    await q.query(`CREATE TABLE IF NOT EXISTS diagnostic_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
      source varchar(24) NOT NULL CHECK (source IN ('manual','obd_live','imported','ai_assisted')),
      adapter_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      dtc_codes jsonb NOT NULL DEFAULT '[]'::jsonb,
      telemetry jsonb NOT NULL DEFAULT '{}'::jsonb,
      hypotheses jsonb NOT NULL DEFAULT '[]'::jsonb,
      evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
      status varchar(24) NOT NULL DEFAULT 'captured' CHECK (status IN ('captured','analyzing','review_required','resolved','archived')),
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_diagnostic_owner_vehicle ON diagnostic_sessions(owner_user_id, vehicle_id, created_at DESC)`);

    await q.query(`CREATE TABLE IF NOT EXISTS workshop_profiles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
      legal_name varchar(200) NOT NULL,
      display_name varchar(200) NOT NULL,
      country_code char(2),
      city varchar(120),
      address text,
      phone varchar(40),
      verification_status varchar(24) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected','suspended')),
      service_categories jsonb NOT NULL DEFAULT '[]'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);

    await q.query(`CREATE TABLE IF NOT EXISTS service_orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      workshop_id uuid REFERENCES workshop_profiles(id) ON DELETE RESTRICT,
      vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
      order_number varchar(40) NOT NULL UNIQUE,
      status varchar(24) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','accepted','in_progress','awaiting_parts','completed','cancelled','disputed')),
      currency char(3),
      subtotal numeric(12,2) NOT NULL DEFAULT 0,
      platform_commission numeric(12,2) NOT NULL DEFAULT 0,
      total numeric(12,2) NOT NULL DEFAULT 0,
      line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_service_orders_customer ON service_orders(customer_user_id, created_at DESC)`);

    await q.query(`CREATE TABLE IF NOT EXISTS audit_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
      action varchar(120) NOT NULL,
      resource_type varchar(80) NOT NULL,
      resource_id varchar(120),
      outcome varchar(24) NOT NULL DEFAULT 'success',
      ip_hash varchar(128),
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX IF NOT EXISTS ix_audit_events_actor_date ON audit_events(actor_user_id, created_at DESC)`);
  }

  async down(q: QueryRunner): Promise<void> {
    for (const table of ['audit_events','service_orders','workshop_profiles','diagnostic_sessions','maintenance_records','inspections','three_d_assets','part_fitments','catalog_parts','vehicle_variants','vehicle_models','manufacturers','data_sources']) {
      await q.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }
  }
}
