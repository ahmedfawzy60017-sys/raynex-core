# RAYNEX 1.0.0 — Integrated Development Release

**Release label:** `1.0.0-development`  
**Status:** integrated development foundation, not production-complete.

This release consolidates the RAYNEX product direction into one evolving codebase. It does not claim that all external datasets, hardware integrations, mobile clients, licensed assets, or production operations are complete.

## Implemented in this archive

- Existing v0.5.0 React + TypeScript + Tailwind web app, Arabic/English switch and RTL.
- Existing NestJS API, PostgreSQL migrations, JWT email/password authentication, owner-scoped vehicle CRUD.
- Existing interactive Three.js/R3F illustrative 3D laboratory.
- Global catalog schema: data sources, manufacturers, models, variants, parts, fitments and 3D asset registry.
- Operational schema: inspections, maintenance history, diagnostic sessions, workshops, service orders and audit events.
- `GET /api/v1/platform/capabilities` release capability/readiness manifest.
- Authenticated `GET/POST /api/v1/inspections`.
- Authenticated `GET/POST /api/v1/maintenance-records`.
- Vehicle ownership checks on inspection and maintenance writes.

## Explicitly not complete / requires external dependencies

- The global vehicle and OEM parts catalog contains schema only, not a populated worldwide dataset.
- VIN decoding requires configured provider adapters and market-specific validation.
- Exact-variant 3D requires licensed, validated CAD/GLB assets. The current viewer is illustrative.
- Live OBD-II requires compatible hardware, device-specific Bluetooth implementation and protocol testing.
- RAYNEX AI is cloud-only and requires an AI provider, licensed knowledge sources, privacy/consent controls, safety evaluations and operational budgets.
- Native Android/iOS applications are not part of this archive.
- Google/Apple sign-in, phone/SMS authentication, email verification, password reset, MFA and refresh-token rotation are not yet implemented.
- Workshop workflows, inventory, invoicing, customer CRM, booking, payment collection, commission calculation/settlement and dispute management are schema-level only.
- Inspection PDF/report rendering, evidence storage, media scanning and digital signatures are not yet implemented.
- Diagnostic session capture/list/detail APIs are implemented for manually supplied/imported data; live OBD transport and AI analysis are not.
- Full RBAC/ABAC, tenant/workshop membership, complete audit-event emission, rate limiting, WAF, observability, backups/restore drills, penetration testing and production deployment hardening remain required.

## API additions

- `GET /api/v1/platform/capabilities`
- `GET /api/v1/inspections?vehicleId=<uuid>` (JWT)
- `POST /api/v1/inspections` (JWT)
- `GET /api/v1/maintenance-records?vehicleId=<uuid>` (JWT)
- `GET /api/v1/diagnostic-sessions` (JWT)
- `GET /api/v1/diagnostic-sessions/:id` (JWT)
- `POST /api/v1/diagnostic-sessions` (JWT)
- `GET /api/v1/parts?q=<text>&system=<code>&oem=<number>`
- `POST /api/v1/maintenance-records` (JWT)
- `GET /api/v1/diagnostic-sessions` (JWT)
- `GET /api/v1/diagnostic-sessions/:id` (JWT)
- `POST /api/v1/diagnostic-sessions` (JWT)
- `GET /api/v1/parts?q=<text>&system=<code>&oem=<number>`

### Inspection creation example

```json
{
  "vehicleId": "00000000-0000-0000-0000-000000000000",
  "inspectionType": "pre_purchase",
  "reportLocale": "ar",
  "findings": [],
  "evidence": []
}
```

### Maintenance record example

```json
{
  "vehicleId": "00000000-0000-0000-0000-000000000000",
  "category": "engine_oil",
  "title": "Engine oil and filter replacement",
  "performedAt": "2026-11-02T12:00:00.000Z",
  "odometerKm": 85000,
  "costAmount": 1500,
  "currency": "EGP"
}
```

## Release gate

Do not label this release production-ready until dependencies are configured and the following are demonstrated: clean install, API and web production builds, migrations on a clean database, unit/integration tests, auth and ownership tests, security review, backup/restore, performance testing, mobile device tests, accessibility/localization review, and end-to-end acceptance testing.
