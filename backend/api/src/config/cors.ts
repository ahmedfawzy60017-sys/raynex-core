/** Parses CORS_ORIGIN into an allow-list. Wildcards are never honoured; falls back to the local dev origin. */
export function parseOrigins(raw: string | undefined): string[] {
  const list = (raw ?? '').split(',').map((s) => s.trim().replace(/\/+$/, '')).filter((s) => s && s !== '*');
  return list.length > 0 ? list : ['http://localhost:5173'];
}
