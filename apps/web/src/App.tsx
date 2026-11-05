import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { api, isAuthError, localizeError, type Lang } from './lib/api';
import Raynex3D from './features/three-d/Raynex3D';
import GarageOperations from './features/operations/GarageOperations';

type Vehicle = { id: string; nickname: string | null; modelYear: number | null; marketCode: string | null; verificationStatus: string; createdAt: string };
type AuthResult = { accessToken: string; user: { id: string; email: string } };
const copy = {
  en: { brand: 'RAYNEX', tagline: 'Vehicle intelligence, connected.', dashboard: 'Dashboard', garage: 'My garage', signIn: 'Sign in', create: 'Create account', email: 'Email address', password: 'Password (12+ characters)', name: 'Display name', welcome: 'Your vehicle command center', subtitle: 'A clear view of your vehicles. More RAYNEX modules will connect here as they become available.', vehicles: 'Registered vehicles', addVehicle: 'Add vehicle', nickname: 'Vehicle nickname', year: 'Model year', market: 'Market code', save: 'Save vehicle', empty: 'No vehicles yet', emptyHint: 'Add your first vehicle to start your digital garage.', logout: 'Sign out', loading: 'Please wait…', apiOnline: 'API reachable', apiOffline: 'API unavailable', secure: 'Your session is held in memory for this tab.', error: 'Something went wrong', signInHint: 'Sign in to manage your garage', registerHint: 'Create your RAYNEX account', noAccount: 'New to RAYNEX?', haveAccount: 'Already have an account?', switchRegister: 'Create an account', switchLogin: 'Sign in instead', yearOptional: 'Optional', marketHint: 'e.g. EG', status: 'Record status', unverified: 'Unverified', unnamed: 'Unnamed vehicle', sessionExpired: 'Your session expired. Please sign in again.', language: 'العربية' },
  ar: { brand: 'RAYNEX', tagline: 'ذكاء السيارات… في مكان واحد.', dashboard: 'لوحة التحكم', garage: 'سياراتي', signIn: 'تسجيل الدخول', create: 'إنشاء حساب', email: 'البريد الإلكتروني', password: 'كلمة المرور (12 حرفًا فأكثر)', name: 'الاسم الظاهر', welcome: 'مركز إدارة سياراتك', subtitle: 'تابع سياراتك من مكان واحد. ستتصل هنا وحدات RAYNEX الأخرى عند اكتمالها.', vehicles: 'السيارات المسجلة', addVehicle: 'إضافة سيارة', nickname: 'اسم السيارة', year: 'سنة الموديل', market: 'رمز السوق', save: 'حفظ السيارة', empty: 'لا توجد سيارات بعد', emptyHint: 'أضف سيارتك الأولى لبدء ملفها الرقمي.', logout: 'تسجيل الخروج', loading: 'يرجى الانتظار…', apiOnline: 'الخادم متصل', apiOffline: 'الخادم غير متاح', secure: 'جلسة الدخول محفوظة في ذاكرة علامة التبويب فقط.', error: 'حدث خطأ', signInHint: 'سجّل الدخول لإدارة سياراتك', registerHint: 'أنشئ حساب RAYNEX جديدًا', noAccount: 'جديد في RAYNEX؟', haveAccount: 'لديك حساب بالفعل؟', switchRegister: 'إنشاء حساب', switchLogin: 'تسجيل الدخول', yearOptional: 'اختياري', marketHint: 'مثال: EG', status: 'حالة السجل', unverified: 'غير متحقق', unnamed: 'سيارة بدون اسم', sessionExpired: 'انتهت جلسة الدخول. سجّل الدخول مجددًا.', language: 'English' }
};

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const t = copy[lang];
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthResult['user'] | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [apiOnline, setApiOnline] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [form, setForm] = useState({ nickname: '', modelYear: '', marketCode: 'EG' });
  const isArabic = lang === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';

  const signOut = useCallback((message = '') => { setToken(null); setUser(null); setVehicles([]); setShowVehicleForm(false); setError(message); }, []);
  // Any 401 (token expired after 15 min) returns the user to the sign-in screen with an explanation instead of a silent broken dashboard.
  const handleFailure = useCallback((err: unknown) => {
    if (isAuthError(err)) signOut(copy[lang].sessionExpired); else setError(localizeError(err, lang));
  }, [lang, signOut]);

  // Keep <html> in sync so screen readers, hyphenation and native form controls follow the active language/direction.
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = direction; }, [lang, direction]);
  useEffect(() => {
    let alive = true;
    const check = () => api<{ status: string }>('/health', null, {}, 5_000).then(() => alive && setApiOnline(true)).catch(() => alive && setApiOnline(false));
    check(); const id = setInterval(check, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  useEffect(() => {
    if (!token) return;
    let alive = true;
    api<{ data: Vehicle[] }>('/vehicles?page=1&limit=100', token).then(r => { if (alive) setVehicles(r.data); }).catch(e => { if (alive) handleFailure(e); });
    return () => { alive = false; };
  }, [token, handleFailure]);
  const vehicleCount = useMemo(() => vehicles.length.toString().padStart(2, '0'), [vehicles.length]);

  async function authenticate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    const data = new FormData(e.currentTarget);
    const payload: Record<string, string> = { email: String(data.get('email')), password: String(data.get('password')) };
    if (mode === 'register') payload.displayName = String(data.get('displayName') || '');
    try {
      const result = await api<AuthResult>(mode === 'login' ? '/auth/login' : '/auth/register', undefined, { method: 'POST', body: JSON.stringify(payload) });
      setToken(result.accessToken); setUser(result.user);
    } catch (err) { setError(localizeError(err, lang)); }
    finally { setBusy(false); }
  }

  async function addVehicle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!token) return; setBusy(true); setError('');
    try {
      const payload = { nickname: form.nickname.trim() || undefined, modelYear: form.modelYear ? Number(form.modelYear) : undefined, marketCode: form.marketCode.trim() || undefined };
      const created = await api<Vehicle>('/vehicles', token, { method: 'POST', body: JSON.stringify(payload) });
      setVehicles(current => [created, ...current]); setForm({ nickname: '', modelYear: '', marketCode: 'EG' }); setShowVehicleForm(false);
    } catch (err) { handleFailure(err); }
    finally { setBusy(false); }
  }

  return <div className="app-shell" dir={direction}>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar">
      <a className="brand" href="#top"><span className="brand-mark">R</span><span><b>{t.brand}</b><small>{t.tagline}</small></span></a>
      <div className="top-actions"><span className={`api-state ${apiOnline ? 'online' : 'offline'}`}><i />{apiOnline ? t.apiOnline : t.apiOffline}</span><button className="language-button" onClick={() => { setLang(isArabic ? 'en' : 'ar'); setError(''); }}>{t.language}</button>{token && <button className="ghost-button" onClick={() => signOut()}>{t.logout}</button>}</div>
    </header>

    {!token ? <main className="auth-layout" id="top">
      <section className="hero-copy"><div className="eyebrow"><span /> NEXT-GEN AUTOMOTIVE PLATFORM</div><h1>Drive smarter.<br /><em>Know more.</em></h1><p>{t.subtitle}</p><div className="hero-stats"><div><strong>01</strong><span>CONNECTED GARAGE</span></div><div><strong>∞</strong><span>BUILT TO EXPAND</span></div></div><div className="orbit"><div className="orbit-ring ring-a"/><div className="orbit-ring ring-b"/><div className="orbit-core"><span>RX</span><small>INTELLIGENCE</small></div><i className="orbit-dot dot-a"/><i className="orbit-dot dot-b"/><i className="orbit-dot dot-c"/></div></section>
      <section className="auth-card"><div className="card-kicker">RAYNEX IDENTITY <span>● SECURE ACCESS</span></div><h2>{mode === 'login' ? t.signIn : t.create}</h2><p className="muted">{mode === 'login' ? t.signInHint : t.registerHint}</p>
        <form onSubmit={authenticate} className="form-stack">{mode === 'register' && <label>{t.name}<input name="displayName" maxLength={120} placeholder={t.name} /></label>}<label>{t.email}<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label>{t.password}<input name="password" type="password" minLength={12} maxLength={72} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required placeholder="••••••••••••" /></label>{error && <div className="error-banner">{error}</div>}<button className="primary-button" disabled={busy}>{busy ? t.loading : mode === 'login' ? t.signIn : t.create}<span>↗</span></button></form>
        <div className="switch-mode">{mode === 'login' ? t.noAccount : t.haveAccount}<button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? t.switchRegister : t.switchLogin}</button></div><div className="card-foot">{t.secure}</div>
      </section>
    </main> : <main className="dashboard" id="top">
      <div className="welcome-row"><div><div className="eyebrow"><span /> PERSONAL COMMAND CENTER</div><h1>{t.welcome}</h1><p className="muted">{user?.email}</p></div><button className="primary-button compact" onClick={() => setShowVehicleForm(v => !v)}>{t.addVehicle}<span>＋</span></button></div>
      <section className="metric-grid"><article className="metric-card"><span>{t.vehicles}</span><strong>{vehicleCount}</strong><small>YOUR DIGITAL GARAGE</small><div className="metric-line" /></article><article className="metric-card"><span>RAYNEX SCAN</span><strong>—</strong><small>OBD DEVICE NOT CONNECTED</small><div className="metric-line muted-line" /></article><article className="metric-card"><span>RAYNEX AI</span><strong>Cloud</strong><small>AI CONNECTOR NOT CONFIGURED</small><div className="metric-line muted-line" /></article></section>
      {showVehicleForm && <section className="vehicle-form-card"><div><div className="eyebrow"><span /> NEW VEHICLE</div><h2>{t.addVehicle}</h2></div><form onSubmit={addVehicle} className="vehicle-form"><label>{t.nickname}<input value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} maxLength={80} placeholder="My daily driver" /></label><label>{t.year}<input type="number" min="1886" max="2100" value={form.modelYear} onChange={e => setForm({ ...form, modelYear: e.target.value })} placeholder={t.yearOptional} /></label><label>{t.market}<input value={form.marketCode} onChange={e => setForm({ ...form, marketCode: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })} minLength={2} maxLength={8} placeholder={t.marketHint} /></label><button className="primary-button" disabled={busy}>{busy ? t.loading : t.save}<span>↗</span></button></form></section>}
      {error && <div className="error-banner dashboard-error">{error}</div>}
      <section className="garage-section"><div className="section-heading"><div><div className="eyebrow"><span /> VEHICLE PROFILES</div><h2>{t.garage}</h2></div><span className="count-pill">{vehicleCount} RECORDS</span></div>
        {vehicles.length === 0 ? <div className="empty-state"><div className="empty-icon">⌁</div><h3>{t.empty}</h3><p>{t.emptyHint}</p><button className="outline-button" onClick={() => setShowVehicleForm(true)}>{t.addVehicle} ＋</button></div> : <div className="vehicle-grid">{vehicles.map(v => <article className="vehicle-card" key={v.id}><div className="vehicle-card-top"><span className="vehicle-symbol">⌁</span><span className="status-tag">{v.verificationStatus || t.unverified}</span></div><h3>{v.nickname || t.unnamed}</h3><p>{v.modelYear || '—'} <span>·</span> {v.marketCode || '—'}</p><div className="vehicle-id">ID / {v.id.slice(0, 8).toUpperCase()}</div></article>)}</div>}
      </section>
      <GarageOperations token={token} vehicles={vehicles} lang={lang} onAuthExpired={() => signOut(t.sessionExpired)} />
      <Raynex3D lang={lang} />
      <footer className="dashboard-footer"><span>RAYNEX {__APP_VERSION__}</span><span>3D LAB IS AN ILLUSTRATIVE PROTOTYPE · VEHICLE ASSETS NOT YET OEM-VERIFIED</span></footer>
    </main>}
  </div>;
}
