# RAYNEX — Consolidated Hardening Candidate 1.2.0-dev.3

RAYNEX is being developed as a global automotive intelligence platform. This repository consolidates the web/API foundation and adds the normalized automotive data model plus initial authenticated inspection and maintenance workflows.

> **Honest status:** this is `1.2.0-dev.3`, not a claim that every feature or external dataset is complete. See `STATUS.md`, `docs/RAYNEX_FINAL_SCOPE.md`, and `GET /api/v1/platform/capabilities`.

## Implemented

- React + TypeScript + Tailwind dashboard with Arabic/English and RTL foundation.
- NestJS API, PostgreSQL/TypeORM migrations, JWT email/password auth and owner-scoped vehicle CRUD.
- Global catalog schema for data sources, manufacturers, models, variants, parts, fitments and 3D assets.
- Inspection and maintenance data models plus authenticated create/list endpoints.
- Authenticated manual diagnostic session create/list/detail APIs. Unverified imported, live OBD and AI-assisted sessions are rejected until trusted connectors are implemented.
- Parts catalog search API (database-backed; empty until licensed part data is ingested).
- Bilingual dashboard operations panel for inspections, maintenance and manual diagnostic records.
- Diagnostic session, workshop, service-order and audit-event data models.
- Canonical 32-module RAYNEX FINAL registry with explicit status, dependencies and provider requirements.
- Capability/readiness endpoint and `GET /api/v1/platform/modules` endpoint.
- Interactive Three.js 3D viewer (illustrative generic model only).

## Quick start

Requirements: Node.js 20+ (22 recommended), npm or pnpm 9, Docker Compose.

1. Copy `.env.example` to `.env`; set a strong unique `JWT_ACCESS_SECRET` (at least 32 characters) and database password.
2. Start PostgreSQL and Redis:

   ```bash
   docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis
   ```

3. Configure `backend/api/.env` using `backend/api/.env.example`; use a unique random JWT secret (at least 32 characters) and a strong database password. The example values are placeholders and will be rejected by production configuration.
4. Install dependencies and run migrations/API:

   ```bash
   cd backend/api
   npm install
   npm run build
   npm run migration:run
   npm run start:dev
   ```

5. In another terminal, run the web client:

   ```bash
   cd apps/web
   npm install
   npm run build
   npm run dev
   ```

API health: `http://localhost:3000/api/v1/health` (readiness, 503 if the DB is down) · `/api/v1/health/live` (liveness)  
Capability manifest: `http://localhost:3000/api/v1/platform/capabilities`  
Module registry: `http://localhost:3000/api/v1/platform/modules`  
Web client: `http://localhost:5173`

## Authenticated endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET/POST /api/v1/vehicles`
- `GET /api/v1/catalog/vehicle-classes`
- `GET /api/v1/catalog/powertrains`
- `GET /api/v1/catalog/coverage`
- `GET /api/v1/inspections`
- `POST /api/v1/inspections`
- `GET /api/v1/maintenance-records`
- `POST /api/v1/maintenance-records`
- `PATCH /api/v1/maintenance-records/:id`
- `DELETE /api/v1/maintenance-records/:id`
- `GET /api/v1/diagnostic-sessions`
- `GET /api/v1/diagnostic-sessions/:id`
- `POST /api/v1/diagnostic-sessions`
- `GET /api/v1/parts?q=<text>&system=<code>&oem=<number>`

Inspection and maintenance write endpoints validate that the referenced vehicle belongs to the authenticated user.

## Important boundaries

- Catalog schema is not a populated worldwide vehicle/OEM parts database.
- The 3D lab is illustrative, not a verified digital twin for any VIN/model/year/trim.
- Live OBD-II, cloud AI, VIN data providers, mobile apps, payment processing, Google/Apple sign-in, phone/SMS auth, full workshop commerce and production security controls require additional integrations and testing.
- AI inference is designed cloud-only; no local AI inference is claimed.
- Do not use generic 3D geometry or unverified fitment data for repair decisions.

## Final approved scope

The owner-approved consolidated scope is documented in `docs/RAYNEX_FINAL_SCOPE.md`. New essential modules can be added through its extension protocol without rebuilding unrelated domains. The registry is an architecture contract, not a claim that every module is already implemented.

## Documentation

- `docs/product/RAYNEX_MASTER_BLUEPRINT_1.0.md`
- `docs/architecture/GLOBAL-CATALOG-DATA-MODEL.md`
- `docs/3D-ASSET-PIPELINE.md`
- `docs/RELEASE-STATUS-v1.2.0.md`
- `VERIFICATION-REPORT.md`
- `docs/SECURITY-BASELINE.md`
