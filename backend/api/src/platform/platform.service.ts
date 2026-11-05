import { Injectable } from '@nestjs/common';
import { RAYNEX_MODULES } from './module-registry';
import { RAYNEX_VERSION } from '../version';

@Injectable()
export class PlatformService {
  modules() {
    return { product: 'RAYNEX', architecture: 'modular-ecosystem', modules: RAYNEX_MODULES };
  }

  capabilities() {
    const counts = RAYNEX_MODULES.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {});
    return {
      product: 'RAYNEX', release: `${RAYNEX_VERSION}-consolidated-hardening`,
      releaseStatus: 'development-candidate-not-production-ready',
      architecture: { style: 'modular-monolith-first', api: 'versioned', aiInference: 'cloud-only', localization: ['en', 'ar'], rtl: true },
      generatedAt: new Date().toISOString(),
      summary: { totalModules: RAYNEX_MODULES.length, byStatus: counts },
      modules: RAYNEX_MODULES,
      externalDependencies: [
        'Licensed global vehicle, VIN, OEM parts and technical datasets',
        'Licensed exact-variant CAD/3D assets and object storage/CDN',
        'Compatible OBD-II/J1939 adapters, mobile permissions and protocol validation',
        'Cloud AI provider, licensed knowledge sources and safety evaluation',
        'Maps, geocoding, GPS/telematics and charging network providers',
        'Email, SMS, push, Google/Apple identity and payment providers',
        'Country-specific legal, tax, insurance, privacy and marketplace review'
      ],
      releaseGate: 'Do not label production-ready until clean install, builds, migrations, automated tests, security review, backup/restore, performance, mobile and end-to-end acceptance tests pass.'
    };
  }
}
