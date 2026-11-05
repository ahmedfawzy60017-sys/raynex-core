export type Lang = 'en' | 'ar';

// In dev the API runs on :3000; in a production build default to same-origin /api/v1 (set VITE_API_URL to override).
export const API: string = (import.meta.env.VITE_API_URL as string | undefined) || (import.meta.env.DEV ? 'http://localhost:3000/api/v1' : '/api/v1');

export class ApiError extends Error {
  constructor(public code: string, public status: number) { super(code); this.name = 'ApiError'; }
}

const MESSAGES: Record<string, { en: string; ar: string }> = {
  INVALID_CREDENTIALS: { en: 'Incorrect email or password.', ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
  EMAIL_ALREADY_REGISTERED: { en: 'This email is already registered.', ar: 'هذا البريد الإلكتروني مسجل بالفعل.' },
  RATE_LIMIT_EXCEEDED: { en: 'Too many requests. Please wait a minute and try again.', ar: 'عدد الطلبات كبير. انتظر دقيقة ثم حاول مرة أخرى.' },
  VEHICLE_NOT_FOUND: { en: 'Vehicle not found or unavailable to this account.', ar: 'السيارة غير موجودة أو غير متاحة لحسابك.' },
  PERFORMED_AT_CANNOT_BE_FUTURE: { en: 'Maintenance date cannot be in the future.', ar: 'لا يمكن تسجيل صيانة بتاريخ مستقبلي.' },
  PERFORMED_AT_INVALID: { en: 'The date is not valid.', ar: 'التاريخ غير صالح.' },
  INVALID_CATALOG_REFERENCE: { en: 'The selected brand or model does not exist.', ar: 'الماركة أو الموديل المحدد غير موجود.' },
  AUTH_REQUIRED: { en: 'Please sign in.', ar: 'يرجى تسجيل الدخول.' },
  INVALID_OR_EXPIRED_TOKEN: { en: 'Your session expired. Please sign in again.', ar: 'انتهت جلسة الدخول. سجّل الدخول مجددًا.' },
  NETWORK_ERROR: { en: 'Cannot reach the server. Check your connection.', ar: 'تعذر الوصول إلى الخادم. تحقق من الاتصال.' },
  TIMEOUT: { en: 'The server took too long to respond. Try again.', ar: 'استغرق الخادم وقتًا طويلًا في الرد. حاول مرة أخرى.' },
  INVALID_INPUT: { en: 'Some of the data is invalid. Please review it and try again.', ar: 'بعض البيانات غير صالحة. راجعها وحاول مرة أخرى.' },
  REQUEST_FAILED: { en: 'The request could not be completed.', ar: 'تعذر إتمام الطلب.' },
};

/** Maps any thrown value to a user-facing message in the active language. Never shows raw server text. */
export function localizeError(error: unknown, lang: Lang): string {
  const code = error instanceof ApiError ? error.code : 'REQUEST_FAILED';
  return (MESSAGES[code] ?? MESSAGES.REQUEST_FAILED)[lang];
}

export const isAuthError = (error: unknown) => error instanceof ApiError && (error.status === 401 || error.code === 'INVALID_OR_EXPIRED_TOKEN');

export async function api<T>(path: string, token?: string | null, init: RequestInit = {}, timeoutMs = 15_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers as Record<string, string> | undefined) },
    });
  } catch (e) {
    throw new ApiError((e as { name?: string })?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR', 0);
  } finally { clearTimeout(timer); }

  const body = await response.json().catch(() => ({} as Record<string, unknown>));
  if (!response.ok) {
    const raw = (body as { message?: unknown })?.message;
    const first = Array.isArray(raw) ? raw[0] : raw;
    // Server business errors are SCREAMING_SNAKE codes; class-validator messages are free text -> generic "invalid input".
    const code = typeof first === 'string' && /^[A-Z][A-Z0-9_]+$/.test(first) ? first : response.status === 400 ? 'INVALID_INPUT' : response.status === 429 ? 'RATE_LIMIT_EXCEEDED' : `HTTP_${response.status}`;
    throw new ApiError(code, response.status);
  }
  return body as T;
}
