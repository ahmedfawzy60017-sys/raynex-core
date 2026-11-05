import { HttpException, HttpStatus } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';

function ctx(url: string, ip = '10.0.0.1') {
  const headers: Record<string, string> = {};
  const res = { setHeader: (k: string, v: string) => { headers[k] = v; } };
  const req = { ip, originalUrl: url };
  return { headers, context: { switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }) } as any };
}

describe('RateLimitGuard', () => {
  it('returns HTTP 429 with Retry-After once the auth limit is exceeded', () => {
    const guard = new RateLimitGuard();
    for (let i = 0; i < 10; i++) expect(guard.canActivate(ctx('/api/v1/auth/login').context)).toBe(true);
    const blocked = ctx('/api/v1/auth/login');
    let caught: unknown;
    try { guard.canActivate(blocked.context); } catch (e) { caught = e; }
    expect(caught).toBeInstanceOf(HttpException);
    expect((caught as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(Number(blocked.headers['Retry-After'])).toBeGreaterThanOrEqual(1);
  });
  it('classifies by pathname, not by query string', () => {
    const guard = new RateLimitGuard();
    for (let i = 0; i < 11; i++) guard.canActivate(ctx('/api/v1/vehicles?x=/auth/').context); // general tier (limit 120)
    // If the query string had been classified as "auth" (limit 10) the bucket below would already be exhausted.
    for (let i = 0; i < 10; i++) expect(guard.canActivate(ctx('/api/v1/auth/login').context)).toBe(true);
  });
  it('never throttles health probes', () => {
    const guard = new RateLimitGuard();
    for (let i = 0; i < 500; i++) expect(guard.canActivate(ctx('/api/v1/health').context)).toBe(true);
  });
  it('tracks clients independently', () => {
    const guard = new RateLimitGuard();
    for (let i = 0; i < 10; i++) guard.canActivate(ctx('/api/v1/auth/login', '10.0.0.1').context);
    expect(guard.canActivate(ctx('/api/v1/auth/login', '10.0.0.2').context)).toBe(true);
  });
});
