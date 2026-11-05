# RAYNEX 1.2.0 — Consolidated hardening candidate

Status: development candidate; not production-ready.

## Implemented in this candidate
- Consolidates the 1.1.0 module registry, platform scope, catalog taxonomy, operations API and UI.
- Explicit ConfigModule/JwtModule wiring and strict non-placeholder JWT secret validation.
- Soft-delete support for vehicles to avoid foreign-key deletion failures.
- Uniform not-found response for vehicle ownership checks in inspection and diagnostic creation.
- Diagnostic write API accepts manual sessions only; user-submitted `obd_live` and `ai_assisted` claims are rejected by DTO validation until real connectors exist.
- Maintenance input bounds, three-letter currency validation, future-date rejection, update/delete endpoints.
- Audit writes for vehicle, inspection, maintenance and diagnostic operations.
- API rate limiting (in-memory per process: 10/min auth, 30/min parts, 120/min general); production multi-instance deployments must use a shared Redis/API-gateway limiter.
- Escaped LIKE wildcard search characters and bounded part search.
- Frontend form reset uses a stable form reference after async operations; common errors are localized.
- CI workflow and focused diagnostics service tests.

## Important limitations / external dependencies
- The original v0.6 archive was not present in the available project library during this consolidation. This candidate reimplements known hardening items; it does not claim byte-for-byte recovery of v0.6.
- Database migration and integration behavior require PostgreSQL runtime verification. (No migration requires `pg_trgm`; `pgcrypto`/`gen_random_uuid()` is used.)
- No real OBD-II adapter transport, 4G tracker ingestion, OEM telematics API, cloud AI provider, licensed global vehicle/parts datasets, exact OEM CAD/3D library, native Android/iOS app, maps, payments, or production notification provider is included.
- Imported diagnostic sessions are not enabled as a user-assertable source yet; a trusted import pipeline with provenance checks must be implemented first.
- In-memory rate limiting is not distributed and resets on restart; production must use Redis or a gateway.
- Audit events are now written in the same transaction as the business operation (since 1.2.0-dev.3).
- Existing platform registry describes the approved ecosystem and its status; registry entries do not mean those modules are implemented.

## Verification status
- ZIP integrity: checked after packaging.
- Static source checks and JSON validation: performed during packaging.
- TypeScript builds, dependency install, PostgreSQL migration, API integration tests, Docker boot and browser E2E: not claimed unless separately run and recorded in `VERIFICATION-REPORT.md`.
