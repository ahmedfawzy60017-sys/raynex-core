import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface Bucket { count: number; resetAt: number }

/** Single-process baseline limiter. Use a shared Redis store before horizontal scaling. */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();
  private readonly maxBuckets = 50_000;

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const now = Date.now();
    const ip = String(req.ip ?? req.socket?.remoteAddress ?? 'unknown');
    // Classify on the pathname only, so a query string can never change the tier.
    const pathname = String(req.originalUrl ?? req.url ?? req.path ?? '').split('?')[0].toLowerCase();

    // Orchestrator probes must never be throttled (and never consume a client's budget).
    if (/\/health(\/|$)/.test(pathname)) return true;

    const tier = /\/auth(\/|$)/.test(pathname) ? 'auth' : /\/parts(\/|$)/.test(pathname) ? 'parts' : 'general';
    const limit = tier === 'auth' ? 10 : tier === 'parts' ? 30 : 120;
    const windowMs = 60_000;
    const key = `${ip}:${tier}`;

    if (this.buckets.size >= this.maxBuckets) {
      for (const [bucketKey, bucket] of this.buckets) {
        if (bucket.resetAt <= now) this.buckets.delete(bucketKey);
      }
      while (this.buckets.size >= this.maxBuckets) {
        const oldest = this.buckets.keys().next();
        if (oldest.done) break;
        this.buckets.delete(oldest.value);
      }
    }

    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      this.buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > limit) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      // NestJS has no TooManyRequestsException class; use HttpException with 429 explicitly.
      throw new HttpException('RATE_LIMIT_EXCEEDED', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
