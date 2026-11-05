# Global Vehicle Catalog — Data Model Contract

## Core entities

- `manufacturer`: legal/corporate manufacturer and regional aliases.
- `make`: consumer-facing marque linked to manufacturer.
- `vehicle_class` / `vehicle_subtype`: globally extensible taxonomy.
- `model`: model identity with regional aliases.
- `generation`: production generation and effective dates.
- `model_year`: model-year identity, distinct from build date.
- `market`: sales/engineering market and regulatory region.
- `trim`: market-specific trim/grade.
- `powertrain`: energy source and hybrid architecture.
- `engine` / `motor`: engine or electric motor identity and codes.
- `transmission`, `drivetrain`, `ecu_profile`, `vin_pattern`.
- `vehicle_configuration`: exact combination of the above.
- `source_record`: source provider, source ID, license, timestamp and source revision.
- `coverage_assertion`: field/capability state, confidence, reviewer and evidence.

## Rules

1. Internal IDs are stable and never derived from display names.
2. External identifiers are namespaced by source.
3. Market and model-year are first-class dimensions.
4. Preserve historical values; corrections create revisions.
5. Every imported field records provenance and license scope.
6. VIN decoding is evidence for only the fields returned by the source; do not fill unknown fields by guesswork.
7. Fitment is a relation to a defined vehicle configuration, not a loose make/model label.
8. Coverage is independently tracked for specifications, diagnostics, wiring, parts, procedures, 3D and safety data.

## Initial API contract

- `GET /api/v1/catalog/vehicle-classes`
- `GET /api/v1/catalog/powertrains`
- `GET /api/v1/catalog/coverage?class=<canonical-class-id>`

These v0.5 endpoints expose taxonomy scaffolding only. They do not represent a populated global make/model database.
