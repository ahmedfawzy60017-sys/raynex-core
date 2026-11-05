# RAYNEX v0.5.0 — Work-in-progress release status

## Added in this source update
- Master Blueprint 1.0 product and architecture baseline.
- Global vehicle class and powertrain taxonomy seed.
- Public catalog metadata endpoints for vehicle classes, powertrains and explicit coverage states.
- Initial browser 3D interaction lab using Three.js / React Three Fiber: orbit, zoom, select, filter, explode slider and reassemble control.
- Arabic/English labels for the 3D lab.
- Explicit generic-demo warnings and unavailable OEM metadata states.

## Not implemented yet
- Global manufacturer/make/model/year/trim data ingestion.
- VIN decoding providers and licensed source adapters.
- Production 3D CAD/GLB assets or exact vehicle digital twins.
- Full component-level OEM part identities, dimensions, torque and fitment.
- Live OBD hardware integration, AI inference, AR, repair simulation or marketplace transactions.
- Mobile-native app and native AR/OBD integrations.

## Verification
- Source-level review performed for the new files.
- Dependency installation, TypeScript build, API build, database migrations, Docker startup and automated test suites have not yet been run in this environment.
- Run `pnpm install`, `pnpm --filter @raynex/web build`, `pnpm --filter @raynex/api build`, and `pnpm --filter @raynex/api test` before treating this as a validated release.
