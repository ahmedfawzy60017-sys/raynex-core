import { parseOrigins } from './cors';
import { validateEnv } from './db';

const good = { JWT_ACCESS_SECRET: 'q8Zr4vLx2WmN7pTa9KdB3yHcE6uGf1JsXo5RiVn0', DB_PASSWORD: 'a-long-unique-db-password-123' };

describe('parseOrigins', () => {
  it('ignores wildcards and trailing slashes', () => {
    expect(parseOrigins('https://app.example.com/, *')).toEqual(['https://app.example.com']);
  });
  it('falls back to the local dev origin', () => { expect(parseOrigins(undefined)).toEqual(['http://localhost:5173']); });
});

describe('validateEnv', () => {
  it('accepts a strong configuration', () => { expect(() => validateEnv({ ...good })).not.toThrow(); });
  it('rejects placeholder / short JWT secrets and a missing DB password', () => {
    expect(() => validateEnv({ ...good, JWT_ACCESS_SECRET: 'REPLACE-ME-WITH-A-UNIQUE-RANDOM-32-CHAR-VALUE' })).toThrow(/JWT_ACCESS_SECRET/);
    expect(() => validateEnv({ ...good, JWT_ACCESS_SECRET: 'short' })).toThrow(/JWT_ACCESS_SECRET/);
    expect(() => validateEnv({ JWT_ACCESS_SECRET: good.JWT_ACCESS_SECRET })).toThrow(/DB_PASSWORD/);
  });
  it('rejects invalid ports', () => { expect(() => validateEnv({ ...good, DB_PORT: 'abc' })).toThrow(/DB_PORT/); });
  it('requires an explicit non-local CORS allow-list in production', () => {
    expect(() => validateEnv({ ...good, NODE_ENV: 'production' })).toThrow(/CORS_ORIGIN/);
    expect(() => validateEnv({ ...good, NODE_ENV: 'production', CORS_ORIGIN: '*' })).toThrow(/CORS_ORIGIN/);
    expect(() => validateEnv({ ...good, NODE_ENV: 'production', CORS_ORIGIN: 'http://localhost:5173' })).toThrow(/CORS_ORIGIN/);
    expect(() => validateEnv({ ...good, NODE_ENV: 'production', CORS_ORIGIN: 'https://app.example.com' })).not.toThrow();
  });
});
