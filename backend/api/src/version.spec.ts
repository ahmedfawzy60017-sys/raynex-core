import { readFileSync } from 'fs';
import { join } from 'path';
import { RAYNEX_VERSION } from './version';

describe('version consistency', () => {
  it('matches backend/api/package.json, the root package.json and VERSION', () => {
    const api = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')).version;
    expect(api).toBe(RAYNEX_VERSION);
    const rootDir = join(__dirname, '..', '..', '..');
    expect(JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8')).version).toBe(RAYNEX_VERSION);
    expect(readFileSync(join(rootDir, 'VERSION'), 'utf8').trim()).toBe(RAYNEX_VERSION);
  });
});
