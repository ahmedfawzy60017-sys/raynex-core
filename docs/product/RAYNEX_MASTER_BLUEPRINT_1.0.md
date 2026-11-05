# RAYNEX MASTER BLUEPRINT 1.0

**Status:** Product direction and architecture baseline  
**Baseline code:** RAYNEX Starter Foundation v0.4  
**Working release:** v0.5.0 foundation expansion  
**Principle:** Build a global, evidence-led automotive platform in independently testable modules. This document describes the target; it does not imply every module is implemented.

## 1. Product mission

RAYNEX is a connected automotive intelligence platform for vehicle owners, drivers, mechanics, workshops, fleets, dealers, parts suppliers, training providers and mobility partners. Egypt is the initial launch market; the data and software architecture must support global expansion.

## 2. Product pillars

1. **RAYNEX Core:** identity, accounts, consent, roles, tenant boundaries, audit, notifications and shared platform services.
2. **RAYNEX Garage:** multi-vehicle profiles, vehicle identity, ownership-authorized history, documents and maintenance records.
3. **RAYNEX Data:** global vehicle ontology, VIN/WMI decoding adapters, source provenance, data licensing and coverage quality.
4. **RAYNEX Scan / Diag:** OBD-II/EOBD and protocol adapters, DTC interpretation, live parameters, system tests where supported, evidence capture and reports.
5. **RAYNEX AI:** cloud-only orchestrator, diagnostic reasoning, image/audio/video analysis, repair copilot, retrieval over licensed technical sources and safety evaluation.
6. **RAYNEX 3D:** vehicle digital twins, exploded assemblies, part identity, interactive inspection mapping, training and compatible AR.
7. **RAYNEX Parts:** OEM/aftermarket catalog, fitment, cross-reference, supplier availability and marketplace trust.
8. **RAYNEX Care:** maintenance schedules, service history, reminders, warranties and repair records.
9. **RAYNEX Inspect:** pre-purchase, periodic, post-accident and post-repair inspections with photos, evidence, inspector identity and bilingual reports.
10. **RAYNEX Garage Pro:** workshop CRM/ERP, work orders, quotes, customer approval, technician workflow, inventory, invoices and eligible transaction commissions.
11. **RAYNEX Fleet:** vehicle, driver, maintenance, utilization, fuel/energy and operating-cost management.
12. **RAYNEX Market / Rescue:** vehicle listings, valuation, parts commerce, roadside assistance and partner services.
13. **RAYNEX Academy / Engineering Lab:** learning, virtual repair practice and engineering simulations with clear limits.
14. **RAYNEX Platform:** APIs, integrations, analytics, observability, billing and developer access.

## 3. Global vehicle ontology

The catalog must support passenger cars, SUVs/crossovers/MPVs, pickups, vans, trucks, tractor units, buses, motorcycles, scooters, mopeds, ATVs/UTVs, trailers, caravans, emergency/special-purpose vehicles, agricultural machinery and construction equipment where data and product scope permit.

Powertrain families include petrol, diesel, mild/full/PHEV hybrid, battery-electric, hydrogen fuel cell, LPG, CNG, flex-fuel, two-stroke and four-stroke. Store drivetrain and transmission independently from powertrain.

Canonical identity hierarchy:

`manufacturer → make → model → generation → model year → market → trim → powertrain → engine/motor → transmission → ECU/configuration → VIN-specific attributes`

Every canonical record receives an immutable internal ID. Preserve external source IDs, source URL/reference, ingestion timestamp, license/usage terms, region, confidence, validation state and revision history. Never collapse two regional variants merely because their marketing names match.

### Coverage states

- `verified`: validated against authoritative data for the exact variant.
- `partial`: only a subset of fields or systems is validated.
- `unverified`: imported or user-supplied but not independently validated.
- `unsupported`: known to be outside current product capability.
- `not-ingested`: no catalog data has been loaded.

Coverage must be field- and capability-specific: vehicle identity, specifications, VIN, diagnostics, wiring, repair procedures, parts, 3D geometry and torque data can each have different states.

## 4. RAYNEX 3D requirements

### Experience

- 360-degree orbit, zoom, pan, reset, fullscreen and touch controls.
- Showroom, cutaway/X-ray, exploded assembly, micro-component and professional modes.
- Assembly tree, category isolation, transparency, hide/show, selection highlighting and part search.
- Explode/reassemble timeline with pause, step and speed controls.
- Bilingual component cards and spatial labels.
- Link defects, DTC evidence, inspection photos, repairs and part history to component IDs.
- AR only on supported devices and validated tracking targets.

### Component identity

Where authoritative data exists, a component record should include canonical part ID, localized names, OEM reference, supersessions/cross-references, quantity, dimensions, mass/material, location, assembly parent/children, compatibility, torque/sequence, service procedure, source and license. Missing values remain explicitly unavailable; never invent them.

### Asset pipeline

Acquire licensed OEM/supplier CAD or validated geometry → preserve source assembly/part IDs → convert to optimized GLB/glTF → generate LODs → compress meshes/textures → validate scale/orientation/hierarchy → bind part IDs and spatial metadata → run automated and human QA → publish versioned assets to object storage/CDN.

Use Three.js / React Three Fiber for web rendering. Mobile rendering and native AR must be selected after platform/device validation. Support WebGL fallback; use WebGPU only when available. Stream assemblies on demand, use instancing for repeated fasteners, and provide low-bandwidth quality settings.

### Accuracy contract

Never label generic geometry as an exact vehicle model. A visible model must declare its fidelity: exact-variant verified, partial, generic illustrative or unavailable. A 3D appearance does not prove fitment. Do not infer OEM numbers, dimensions, torque or assembly order from an approximate mesh.

## 5. AI operating model

AI inference is cloud-only. The app may cache ordinary user data and provide non-AI offline features, but must not claim local AI inference. Show internet dependency, latency/service availability, consent and data-use notices.

One orchestrator routes requests to specialist services: diagnostics, visual inspection, audio, video, EV/battery, parts, repair, fleet and knowledge retrieval. Each response records input evidence, vehicle configuration, source references, confidence/uncertainty, missing tests and model/version. No definitive diagnosis without sufficient evidence. Escalate safety-critical and uncertain cases to qualified human review.

User vehicle data is not used for model training without explicit opt-in. Apply data minimization, retention controls, tenant isolation and deletion/export workflows.

## 6. Vehicle connectivity

Treat OBD adapters and vehicle protocols as capability-specific adapters, not a universal promise. Support standards and proprietary/OEM pathways only where compatible hardware, documentation, authorization and licensing exist. Distinguish simulated readings from live adapter data. Do not offer ECU flashing in the initial releases. Clearing codes or performing active tests requires explicit consent and safety checks.

Heavy-duty, motorcycle, agricultural and construction equipment require their own protocol/device profiles; do not assume passenger-car OBD-II applies.

## 7. Trust, safety and security

- Authentication hardening, verified contact methods, recovery, session lifecycle and rate limiting.
- RBAC plus tenant-aware authorization; server derives identity from authenticated principal.
- Encryption in transit and at rest, secrets management, audit events and secure backups.
- Explicit consent ledger for telemetry, location, media, integrations and AI processing.
- Technical-source licensing and attribution controls.
- SBOM, dependency scanning, signed releases, security testing and incident response.
- Safety gates for brakes, steering, airbags, HV batteries, fuel systems, lifting and ECU operations.
- No claim of inspection certification unless the operator and process are actually accredited.

## 8. Commercial model

Keep core driver services free during the agreed adoption phase. Define measurable adoption/retention/support thresholds before monetization changes. Paid workshop/mechanic capabilities and transparent commissions on eligible marketplace transactions may be introduced gradually. Disclose fees before confirmation, preserve records and announce policy changes in advance. Do not initiate paid third-party commitments without explicit approval.

## 9. Architecture direction

Start with a modular NestJS backend and clear domain boundaries; split services only when scale/operational needs justify it. React + TypeScript + Tailwind web; React Native plus native modules for mobile; Python/FastAPI cloud AI behind an AI gateway; PostgreSQL/PostGIS; Redis; object storage/CDN; queue/outbox for asynchronous work; OpenAPI contracts; Docker; CI/CD; tests; monitoring and backup/restore drills.

## 10. Release sequence

- **v0.5:** harden foundation, define product blueprint, seed global taxonomy, add coverage endpoints, establish 3D viewer prototype.
- **v0.6:** canonical vehicle identity and source-adapter ingestion framework; first verified regional datasets.
- **v0.7:** parts schema, fitment provenance and catalog search.
- **v0.8:** adapter abstraction and real OBD-II integration tests with compatible hardware.
- **v0.9:** cloud AI gateway, retrieval, evidence records and evaluation harness.
- **v0.10–0.11:** licensed 3D asset pipeline, exact-variant assemblies, inspection mapping and repair guidance.
- **v0.12+:** workshops, marketplace, fleets, EV intelligence, mobile, AR and partner APIs.
- **v1.0:** launch only after security, functional, data-quality, operational and user-acceptance gates pass.

## 11. Definition of done

A feature is not complete because a screen exists. Each release must have acceptance criteria, API contracts, migration/rollback plan, automated tests, manual test evidence, security review where applicable, user-facing limitations, documentation and a reproducible build. Maintain a feature register with `implemented`, `prototype`, `planned`, `blocked` and `retired` states.
