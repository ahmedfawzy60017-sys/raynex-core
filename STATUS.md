# RAYNEX platform status — 1.2.0-dev.3

Hardening release on top of 1.2.0-dev.2. Behaviour and scope are unchanged; this release fixes build-breaking and latent production defects found in a full source review.

## Implemented in this candidate
- 32-module platform registry and module listing API.
- NestJS modules for vehicles, catalog, inspections, maintenance, manual diagnostic sessions, parts search, platform registry and audit events.
- PostgreSQL migrations (5, including the new `1802` integrity migration).
- React/Tailwind bilingual (EN/AR, RTL) dashboard and garage operations screens.
- Security headers, CORS allow-list, strict environment validation, PostgreSQL TLS options, PostgreSQL-backed CI.
- Business writes and their audit rows now commit atomically (single transaction).

## Not production-ready / not yet verified
- No committed pnpm lockfile; the first CI run generates one (uploaded as an artifact) — commit it.
- Full NestJS/Vite builds, migrations and PostgreSQL integration tests have NOT been executed in the authoring environment (no registry/database access). Only syntax parsing and the pure-logic checks listed in `VERIFICATION-REPORT.md` were run.
- Rate limiting is an in-memory single-process store; use Redis/gateway before horizontal scaling.
- No refresh-token flow: access tokens last 15 minutes, then the web app returns to sign-in.
- Live OBD, 4G telematics, OEM APIs, cloud AI, licensed vehicle/parts data, OEM 3D assets, native apps, payments and marketplace integrations still require external credentials, hardware and licences.

## Release gate
Do not deploy to production until CI is green end-to-end (install, typecheck, unit tests, build, migration run/revert, integration tests, web build) and the lockfile is committed.
