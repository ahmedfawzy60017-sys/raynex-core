/** Shared PostgreSQL connection settings for the Nest runtime and the TypeORM CLI (data-source.ts). */
export function dbConnection(env: NodeJS.ProcessEnv) {
  const port = Number(env.DB_PORT ?? 5432);
  return {
    host: env.DB_HOST ?? 'localhost',
    port: Number.isInteger(port) && port > 0 && port < 65536 ? port : 5432,
    username: env.DB_USER ?? 'raynex',
    password: env.DB_PASSWORD,
    database: env.DB_NAME ?? 'raynex',
    ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } : false,
    // Fail fast instead of hanging forever when the database is unreachable; keep the pool bounded.
    connectTimeoutMS: 10_000,
    extra: { max: Number(env.DB_POOL_MAX ?? 10), idleTimeoutMillis: 30_000 },
  };
}

/** Validates environment variables at boot. Throws a clear message instead of failing later at runtime. */
export function validateEnv(env: Record<string, any>) {
  const secret = String(env.JWT_ACCESS_SECRET ?? '');
  if (secret.length < 32 || /replace|change.?me|example|default|secret/i.test(secret)) throw new Error('JWT_ACCESS_SECRET must be a unique, non-placeholder secret of at least 32 characters');
  if (!env.DB_PASSWORD) throw new Error('DB_PASSWORD is required');
  const production = env.NODE_ENV === 'production';
  if (production && (String(env.DB_PASSWORD).length < 16 || /replace|example|default|change.?me/i.test(String(env.DB_PASSWORD)))) throw new Error('DB_PASSWORD must be a unique, non-placeholder value of at least 16 characters in production');
  for (const key of ['PORT', 'DB_PORT']) {
    if (env[key] !== undefined && env[key] !== '' && !(Number.isInteger(Number(env[key])) && Number(env[key]) > 0 && Number(env[key]) < 65536)) throw new Error(`${key} must be a valid TCP port`);
  }
  if (production) {
    const origins = String(env.CORS_ORIGIN ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    if (origins.length === 0) throw new Error('CORS_ORIGIN must be set explicitly in production');
    if (origins.some((o) => o === '*' || /localhost|127\.0\.0\.1/i.test(o))) throw new Error('CORS_ORIGIN must be an explicit allow-list of public origins in production (no wildcard or localhost)');
  }
  return env;
}
