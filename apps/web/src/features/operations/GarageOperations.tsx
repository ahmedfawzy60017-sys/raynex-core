import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, isAuthError, localizeError, type Lang } from '../../lib/api';

type Vehicle = { id: string; nickname: string | null; modelYear: number | null; marketCode: string | null };
type RecordItem = { id: string; title?: string; inspectionType?: string; category?: string; status?: string; createdAt: string; performedAt?: string; dtcCodes?: unknown[]; source?: string };

const DTC_PATTERN = /^[PBCU][0-9A-F]{4}$/;

export default function GarageOperations({ token, vehicles, lang, onAuthExpired }: { token: string; vehicles: Vehicle[]; lang: Lang; onAuthExpired?: () => void }) {
  const ar = lang === 'ar';
  const [tab, setTab] = useState<'inspection'|'maintenance'|'diagnostics'>('inspection');
  const [inspections, setInspections] = useState<RecordItem[]>([]);
  const [maintenance, setMaintenance] = useState<RecordItem[]>([]);
  const [diagnostics, setDiagnostics] = useState<RecordItem[]>([]);
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (!vehicles.some(v => v.id === vehicleId)) setVehicleId(vehicles[0]?.id || ''); }, [vehicles, vehicleId]);
  const fail = useCallback((e: unknown) => { if (isAuthError(e)) onAuthExpired?.(); else setError(localizeError(e, lang)); }, [lang, onAuthExpired]);
  const refresh = useCallback(async () => {
    const [i,m,d] = await Promise.all([
      api<{data:RecordItem[]}>('/inspections', token),
      api<{data:RecordItem[]}>('/maintenance-records', token),
      api<{data:RecordItem[]}>('/diagnostic-sessions', token)
    ]);
    setInspections(i.data); setMaintenance(m.data); setDiagnostics(d.data);
  }, [token]);
  useEffect(() => { refresh().catch(fail); }, [refresh, fail]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    if (!vehicleId) { setError(ar ? 'أضف سيارة أولًا.' : 'Add a vehicle first.'); setBusy(false); return; }
    const formElement = e.currentTarget;
    const fd = new FormData(formElement);
    try {
      if (tab === 'inspection') {
        await api('/inspections', token, { method:'POST', body:JSON.stringify({
          vehicleId, inspectionType:String(fd.get('inspectionType')), reportLocale:lang,
          findings:[], evidence:[]
        })});
        setNotice(ar ? 'تم إنشاء مسودة الفحص.' : 'Inspection draft created.');
      } else if (tab === 'maintenance') {
        await api('/maintenance-records', token, { method:'POST', body:JSON.stringify({
          vehicleId, category:String(fd.get('category')), title:String(fd.get('title')),
          performedAt:String(fd.get('performedAt')), odometerKm:fd.get('odometerKm') ? Number(fd.get('odometerKm')) : undefined,
          costAmount:fd.get('costAmount') ? Number(fd.get('costAmount')) : undefined,
          currency:String(fd.get('currency') || 'EGP').trim().toUpperCase()
        })});
        setNotice(ar ? 'تم حفظ سجل الصيانة.' : 'Maintenance record saved.');
      } else {
        const codes = Array.from(new Set(String(fd.get('dtcCodes') || '').split(/[,\s]+/).map(x=>x.trim().toUpperCase()).filter(Boolean)));
        const invalid = codes.filter(c => !DTC_PATTERN.test(c));
        if (invalid.length) { setError(ar ? `أكواد غير صالحة: ${invalid.join(', ')} (مثال صحيح: P0300)` : `Invalid code(s): ${invalid.join(', ')} (valid example: P0300)`); return; }
        await api('/diagnostic-sessions', token, { method:'POST', body:JSON.stringify({
          vehicleId, source:'manual', dtcCodes:codes.map(code=>({code,source:'user-entered'})), evidence:[]
        })});
        setNotice(ar ? 'تم حفظ جلسة الأعطال اليدوية. لم يتم إجراء تشخيص آلي.' : 'Manual diagnostic session saved. No automated diagnosis was performed.');
      }
      formElement.reset();
      try { await refresh(); } catch (e) { if (isAuthError(e)) onAuthExpired?.(); else setError(ar ? 'تم الحفظ، لكن تعذر تحديث قائمة السجلات.' : 'Saved, but the records list could not be refreshed.'); }
    } catch (e) { fail(e); }
    finally { setBusy(false); }
  }

  const tabs = [
    {id:'inspection', label:ar?'الفحوصات':'Inspections', count:inspections.length},
    {id:'maintenance', label:ar?'سجل الصيانة':'Maintenance', count:maintenance.length},
    {id:'diagnostics', label:ar?'جلسات الأعطال':'Diagnostics', count:diagnostics.length}
  ] as const;
  const items = tab==='inspection'?inspections:tab==='maintenance'?maintenance:diagnostics;
  return <section className="mt-8 rounded-3xl border border-cyan-300/15 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/20" dir={ar?'rtl':'ltr'}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><div className="text-xs font-semibold tracking-[.25em] text-cyan-300">RAYNEX OPERATIONS</div><h2 className="mt-1 text-2xl font-semibold text-white">{ar?'إدارة السيارة':'Vehicle operations'}</h2><p className="mt-1 text-sm text-slate-400">{ar?'فحوصات وسجل صيانة وتوثيق أعطال محفوظة بحسابك.':'Inspections, service history and diagnostic records in your account.'}</p></div>
      <select aria-label={ar?'السيارة':'Vehicle'} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" value={vehicleId} onChange={e=>setVehicleId(e.target.value)}>
        {vehicles.map(v=><option key={v.id} value={v.id}>{v.nickname || `${v.modelYear ?? ''} ${v.marketCode ?? ''}`.trim() || v.id.slice(0,8)}</option>)}
      </select>
    </div>
    <div className="mt-5 flex flex-wrap gap-2">{tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`rounded-xl border px-4 py-2 text-sm ${tab===t.id?'border-cyan-300/60 bg-cyan-300/10 text-cyan-200':'border-slate-800 bg-slate-900 text-slate-400'}`}>{t.label} <span className="ms-1 text-xs opacity-70">{t.count}</span></button>)}</div>
    {error && <p role="alert" className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p>}
    {notice && <p role="status" className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 text-sm text-emerald-200">{notice}</p>}
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(240px,.8fr)_minmax(0,1.2fr)]">
      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="font-semibold text-white">{tab==='inspection'?(ar?'إنشاء فحص':'Start an inspection'):tab==='maintenance'?(ar?'إضافة صيانة':'Add maintenance'): (ar?'تسجيل أكواد أعطال':'Record fault codes')}</h3>
        {tab==='inspection' && <label className="block text-sm text-slate-300">{ar?'نوع الفحص':'Inspection type'}<select name="inspectionType" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"><option value="comprehensive">{ar?'شامل':'Comprehensive'}</option><option value="pre_purchase">{ar?'قبل الشراء':'Pre-purchase'}</option><option value="post_accident">{ar?'بعد حادث':'Post-accident'}</option><option value="post_repair">{ar?'بعد الإصلاح':'Post-repair'}</option><option value="periodic">{ar?'دوري':'Periodic'}</option></select></label>}
        {tab==='maintenance' && <>
          <label className="block text-sm text-slate-300">{ar?'التصنيف':'Category'}<select name="category" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"><option value="engine_oil">Engine oil</option><option value="filters">Filters</option><option value="brakes">Brakes</option><option value="tires">Tires</option><option value="cooling">Cooling</option><option value="electrical">Electrical</option><option value="other">Other</option></select></label>
          <label className="block text-sm text-slate-300">{ar?'وصف الخدمة':'Service title'}<input name="title" required maxLength={200} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white" placeholder={ar?'تغيير زيت المحرك':'Engine oil replacement'}/></label>
          <div className="grid grid-cols-2 gap-2"><label className="text-sm text-slate-300">{ar?'التاريخ':'Date'}<input type="date" name="performedAt" required max={new Date().toISOString().slice(0,10)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"/></label><label className="text-sm text-slate-300">{ar?'عداد المسافة كم':'Odometer km'}<input type="number" min="0" name="odometerKm" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"/></label></div>
          <div className="grid grid-cols-2 gap-2"><label className="text-sm text-slate-300">{ar?'التكلفة':'Cost'}<input type="number" min="0" step=".01" name="costAmount" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"/></label><label className="text-sm text-slate-300">{ar?'العملة':'Currency'}<input name="currency" defaultValue="EGP" maxLength={3} pattern="[A-Za-z]{3}" style={{textTransform:'uppercase'}} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"/></label></div>
        </>}
        {tab==='diagnostics' && <><label className="block text-sm text-slate-300">{ar?'أكواد الأعطال (افصل بينها بفاصلة)':'DTC codes (comma-separated)'}<input name="dtcCodes" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 font-mono text-white" placeholder="P0300, P0420"/></label><p className="text-xs leading-5 text-amber-200/80">{ar?'تسجيل يدوي فقط. لا يوجد اتصال OBD أو تشخيص آلي في هذه الوظيفة.':'Manual entry only. This does not connect to OBD or run automated diagnosis.'}</p></>}
        <button disabled={busy || !vehicles.length} className="w-full rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">{busy?(ar?'جارٍ الحفظ…':'Saving…'):(ar?'حفظ':'Save record')}</button>
      </form>
      <div className="min-w-0">
        <h3 className="mb-3 font-semibold text-white">{ar?'السجلات الأخيرة':'Recent records'}</h3>
        {items.length===0?<div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">{ar?'لا توجد سجلات حتى الآن.':'No records yet.'}</div>:<div className="space-y-2">{items.map(item=><article key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3"><div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-slate-100">{item.title || item.inspectionType || item.source || item.category || 'Record'}</strong><span className="text-xs text-slate-500">{new Date(item.performedAt || item.createdAt).toLocaleDateString(lang==='ar'?'ar-EG':'en-US')}</span></div><div className="mt-1 text-xs text-slate-500">{item.status || (item.dtcCodes?.length ? `${item.dtcCodes.length} DTC entries` : 'Draft')} · {item.id.slice(0,8)}</div></article>)}</div>}
      </div>
    </div>
  </section>;
}
