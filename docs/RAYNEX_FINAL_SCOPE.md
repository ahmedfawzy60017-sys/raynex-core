# RAYNEX FINAL — Consolidated Product Scope

**Scope decision:** Approved by the product owner on 2026-11-02. This is the canonical product boundary for the unified RAYNEX ecosystem. Modules are included in the architecture even when delivery is phased or external dependencies are outstanding.

## Product principles

1. One product, one canonical repository, one versioned API and shared identity/vehicle/data foundations.
2. Modular boundaries: modules own their domain logic and data; integration happens through versioned contracts, domain events and documented adapters.
3. Modular-monolith-first: deploy a coherent system initially, extract services only when scale, isolation or team ownership justifies it. Avoid premature microservices.
4. Never fabricate vehicle specifications, VIN results, OEM references, torque values, fitment, diagnostic conclusions or inspection evidence.
5. Every external fact carries provenance, market/variant scope, license/usage constraints, verification state and freshness where applicable.
6. AI inference is cloud-only. Client-side caching and ordinary app workflows are not local AI.
7. Security, privacy, consent, auditability, accessibility, localization and observability are cross-cutting requirements, not optional modules.
8. Free-core/adoption strategy remains in force. No monetization transition without previously defined adoption thresholds, clear notice and transparent terms.

## Canonical module inventory

The machine-readable registry is `backend/api/src/platform/module-registry.ts`; `GET /api/v1/platform/modules` exposes it. `GET /api/v1/platform/capabilities` reports current implementation status.

| Domain | Included modules |
|---|---|
| Identity & trust | RAYNEX ID, RAYNEX TRUST, organization/workshop memberships, role and policy management |
| Vehicle foundation | Digital Garage, global vehicle ontology, VIN identity, parts/fitment, 3D digital twin, diagnostics/OBD, INSPECT, maintenance, HISTORY, SAFETY/recalls |
| Intelligence | Cloud-only RAYNEX AI, evidence-based diagnostic orchestration, technical knowledge and source provenance |
| Business & commerce | Workshop operations, CRM, inventory, quotations, invoicing, bookings, marketplace, resale, claims, payments, subscriptions, refunds and commissions |
| Mobility & energy | FLEET, EV, CHARGE, RESCUE, maps, routing, telematics and roadside dispatch |
| Platform services | DATA governance, CONNECT integrations, NOTIFY, ANALYTICS, SUPPORT, localization, admin console, audit/compliance |
| Clients | Responsive web, Android and iOS; secure OBD/device integrations and ordinary offline workflows |
| Vehicle categories | Passenger, SUV/crossover, MPV, pickup, van, truck, bus, motorcycle, scooter, ATV/UTV, trailer, emergency/special, agricultural and construction vehicles where reliable data and scope permit |
| Powertrains | Petrol, diesel, mild/full/PHEV hybrid, BEV, hydrogen fuel cell, LPG, CNG, flex fuel, two-/four-stroke; drivetrain and transmission modeled independently |

## Domain boundaries and shared contracts

- **Identity & authorization:** account, organization, membership, roles, policies, delegated access and session lifecycle. Tenant and resource ownership are enforced server-side.
- **Vehicle identity:** manufacturer → make → model → generation → model year → market → trim → powertrain → engine/motor → transmission → ECU/configuration → VIN-specific attributes. Global coverage is data-provider dependent; unknown values remain unknown.
- **Parts:** canonical part identity, OEM numbers, supersessions, cross references, fitment evidence, dimensions, quantity, torque/sequence only when sourced, market applicability and source/license metadata.
- **3D assets:** asset-to-variant and node-to-part mapping, coordinate/unit validation, assembly hierarchy, LOD, compression, versioning and quality approval. Generic demo geometry is never represented as an exact vehicle.
- **Diagnostics & AI:** raw observations/evidence → normalized signals → hypotheses → required tests → reviewed result. Confidence and source citations are explicit; no definitive diagnosis without adequate evidence. Critical operations require human confirmation.
- **Inspection/history:** immutable evidence references, actor/time/source, consent, finding severity, report versions and corrections. Vehicle history is consent-based and never silently exposes owner identity.
- **Commerce:** quote/order/payment/refund/commission/settlement ledger with idempotency, reconciliation, dispute and audit workflows. Payment-provider status is authoritative for settlement.
- **Integration:** adapters isolate provider-specific payloads. Webhooks are signed, replay-protected, idempotent and versioned. No provider credential is committed to source control.

## Cross-cutting requirements

- Country, locale, timezone, currency, tax and measurement-unit configuration.
- Arabic/English from the start, full RTL, locale-aware numbers/dates and translation coverage checks.
- Privacy by design: data minimization, explicit consent, retention policies, export/delete workflows, tenant isolation and no model training on customer data without explicit opt-in.
- Security: short-lived access tokens, refresh rotation/revocation, MFA/passkeys roadmap, rate limiting, secrets management, encryption, secure uploads, malware scanning, audit logs and least privilege.
- Reliability: health/readiness checks, structured logs, metrics, tracing, backups, restore drills, migrations, feature flags and rollback plans.
- Accessibility: keyboard navigation, screen-reader labels, contrast, reduced motion and responsive layouts.
- API compatibility: `/api/v1`, schema contracts, deprecation windows, idempotency keys and documented error envelopes.
- Offline support is limited to cached user-authorized data and ordinary app actions; AI processing remains cloud-based and requires connectivity.

## Delivery and truth labels

Each module must use one of: `implemented`, `partial`, `schema-ready`, `provider-required`, `prototype`, `planned`. A status may be promoted only after its acceptance tests pass. A database table or UI mock alone does not make a module implemented.

Production launch requires clean dependency installation, web/API/mobile builds, clean database migrations, unit/integration/e2e tests, authorization and tenant-isolation tests, security review, backup/restore drill, performance and accessibility checks, localization review, operational monitoring and signed-off acceptance criteria.

## Extension protocol

A new module must provide: owner/domain, purpose, data classification, dependencies, API/event contracts, authorization policy, localization keys, audit events, retention rules, failure modes, observability, test plan, migration/rollback plan and explicit external dependencies. It must integrate through existing contracts rather than modifying unrelated module internals. New essential modules may be added without rebuilding the platform when they follow this protocol.
