# Changelog

## 1.2.0-dev.1
- Consolidated 1.1.0 foundation and 32-module ecosystem registry.
- Reimplemented known security hardening: uniform vehicle ownership responses, UUID route parsing, vehicle soft-delete, strict JWT secret validation, diagnostic source restrictions, audit writes, maintenance bounds and CRUD, parts query escaping, rate limiting, localized UI errors and async-safe form reset.
- Added CI workflow and focused diagnostic tests.
- Explicitly records missing v0.6 source archive and unverified external/runtime integrations.

## 1.2.0-dev.2 — 2026-11-02
- Merged security and CI baseline from RAYNEX v0.6.0 into the consolidated 1.2.0 development tree.
- Restored API response security headers, trusted-proxy opt-in, allow-listed CORS parsing, mandatory database password validation, and PostgreSQL TLS configuration.
- Restored PostgreSQL-backed CI, API typecheck, build artifact path verification, and integration test stage.
- Bounded the in-memory global rate-limit bucket store and added Retry-After responses.
- Dependency lockfile and full runtime verification remain outstanding.

## 1.2.0-dev.3 — 2026-11-02
### Fixed (build / startup breakers)
- `RateLimitGuard` imported `TooManyRequestsException`, which does not exist in NestJS 10 (compile error). Now throws `HttpException(…, 429)` with `Retry-After`.
- Compiled-output migrations: `data-source` glob `database/*{.ts,.js}` also matched the emitted `*.d.ts` files, which crashes `migration:run` inside the production container. Globs now select only `.js` (or only `.ts` under ts-node) and only `[0-9]*-*` migration files.
- `tsconfig` `incremental` + Nest `deleteOutDir` could produce an empty `dist` on the second build; incremental removed. Added explicit `include`.
- Data source now honours `DB_SSL*` (migrations previously could not reach a TLS-only database).
- Integration test no longer uses `synchronize: true` on a migrated schema (it could drop migration-managed indexes/constraints); it cleans up its own rows.
- `repo.exist()` replaced with a `findOne` lookup (API not present in every supported TypeORM 0.3.x).

### Fixed (latent runtime / security defects)
- Login: constant-time behaviour for unknown emails (dummy bcrypt compare), no 12-char minimum on login, 72-**byte** password limit (bcrypt truncation), e-mail trim/lower-casing at the DTO.
- JWT guard pins `HS256`; database outages are no longer disguised as `401`.
- Rate limiter classifies by pathname only, exempts `/health*`.
- Vehicle update copies a whitelist of fields only; unknown brand/model ids return `400 INVALID_CATALOG_REFERENCE`; market code normalised.
- Create/update/delete paths and audit rows are transactional; vehicle ownership is checked with `FOR SHARE` to prevent a concurrent soft-delete race.
- Maintenance: impossible calendar dates rejected (`PERFORMED_AT_INVALID`), currency upper-cased, deterministic ordering.
- Diagnostics: DTC codes upper-cased and de-duplicated; inspection findings/evidence array sizes bounded.
- `/health` returns `503` when the database is down; new `/health/live` liveness probe.
- Environment validation moved to `config/db.ts` (ports, production CORS allow-list with no wildcard/localhost); pool and connect timeouts; `unhandledRejection` handler.
- Migration `1793` adds the owner FK `NOT VALID` so legacy rows cannot block an upgrade; new migration `1802` removes duplicate indexes and adds brand/model FKs and supporting indexes.

### Fixed (web)
- Shared API client with timeout, network/timeout errors, and bilingual error mapping (raw server codes/arrays no longer shown).
- Expired token (401) returns the user to sign-in with a message instead of leaving a broken dashboard.
- Race-safe effects (no state updates after unmount/sign-out), periodic API status check, `<html lang/dir>` kept in sync, localized strings, DTC pre-validation, uppercase currency, future-date guard, RTL-safe spacing, version shown from `package.json`.
- Production API default is same-origin `/api/v1` (no hard-coded localhost in production builds).

### Infrastructure
- Dockerfile: lockfile-aware install, build-output assertion, non-root user, `HEALTHCHECK`; `.dockerignore` added.
- docker-compose: Postgres/Redis/API bound to `127.0.0.1`, explicit `CORS_ORIGIN`, API healthcheck.
- CI: least-privilege permissions, concurrency, timeouts, frozen-lockfile when present, lockfile artifact, migrations run from compiled output and verified reversible.

### Tests added
- Rate limiter, environment/CORS validation, auth service (timing/suspended/active), version consistency, DTC normalisation.
