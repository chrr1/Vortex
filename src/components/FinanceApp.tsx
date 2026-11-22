// @ts-nocheck
'use client';
// Port dari prototipe: template htm dipertahankan agar tampilan identik. Pecah ke JSX/komponen kecil bertahap.
import React, { useState, useMemo } from 'react';
import * as R from 'recharts';
import htm from 'htm';
const html = htm.bind(React.createElement);
const IC = { grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/>', layers: '<path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5"/>', cog: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>', help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.01"/>', out: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>', bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>', moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>', chev: '<path d="m6 9 6 6 6-6"/>', swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>', plus: '<path d="M12 5v14M5 12h14"/>', mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', dots: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>', up: '<path d="M7 17 17 7M9 7h8v8"/>', down: '<path d="M7 7l10 10M17 9v8H9"/>', filt: '<path d="M4 6h16M7 12h10M10 18h4"/>', card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>', wal: '<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l12-3v3M17 13.5v.01"/>', pct: '<path d="M5 19 19 5"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>' };
const I = (k, s = 18) => html`<svg width=${s} height=${s} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" dangerouslySetInnerHTML=${{ __html: IC[k] }}/>`;
const fmt = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
const CATS = ['Makanan', 'Transportasi', 'Hiburan', 'Belanja', 'Tagihan', 'Pemasukan', 'Lainnya'];
const EM = { Makanan: '🍔', Transportasi: '⛽', Hiburan: '🎬', Belanja: '🛍️', Tagihan: '🧾', Pemasukan: '💰', Lainnya: '📦' };
const WAL = [{ id: 'bca', n: 'BCA', b: 1500000, no: '6782', on: 1 }, { id: 'cash', n: 'Cash', b: 300000, no: '0001', on: 1 }, { id: 'dana', n: 'DANA', b: 250000, no: '4356', on: 1 }, { id: 'gopay', n: 'GoPay', b: 150000, no: '9120', on: 0 }];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu'];
const TREND = [[2.1, 1.6], [2.8, 1.4], [2.4, 1.2], [2.6, 1.7], [3.1, 1.5], [2.9, 2.1], [2.7, 1.8], [2.5, 1.6]].map((v, i) => ({ m: MON[i], Pengeluaran: v[0], Pemasukan: v[1] }));
const BUD = [['Makanan', 500000], ['Transportasi', 300000], ['Hiburan', 200000], ['Belanja', 800000]];
const MC = { manual: ['#2f80ed', 'Manual'], ai_chat: ['#f26a2e', 'AI Chat'], voice: ['#22a55b', 'Voice'] };
let uid = 77; const nowS = () => { const d = new Date(); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/(\w+) (\d{4})/, '$1, $2') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
const parseTxDate = (s) => { if (!s) return new Date(); const d = new Date(s.replace(',', '')); return isNaN(d.getTime()) ? new Date() : d };
const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isSameWeek = (d, now) => { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0, 0, 0, 0); const e = new Date(s); e.setDate(s.getDate() + 7); return d >= s && d < e };
const isSameMonth = (d, now) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
const T0 = [
  { id: 76, type: 'expense', amount: 38000, category: 'Makanan', description: 'Sarapan & Kopi', wallet: 'cash', date: '22 Nov, 2026 08:10 AM', m: 'manual' },
  { id: 75, type: 'income', amount: 4500000, category: 'Pemasukan', description: 'Gaji freelance', wallet: 'bca', date: '22 Nov, 2026 09:15 AM', m: 'ai_chat' },
  { id: 74, type: 'expense', amount: 35000, category: 'Makanan', description: 'Makan siang', wallet: 'cash', date: '21 Nov, 2026 12:10 PM', m: 'voice' },
  { id: 73, type: 'expense', amount: 25000, category: 'Transportasi', description: 'Bensin', wallet: 'cash', date: '21 Nov, 2026 08:40 AM', m: 'ai_chat' },
  { id: 72, type: 'expense', amount: 150000, category: 'Hiburan', description: 'Langganan streaming', wallet: 'gopay', date: '19 Nov, 2026 07:05 PM', m: 'manual' },
  { id: 71, type: 'expense', amount: 420000, category: 'Belanja', description: 'Belanja bulanan', wallet: 'dana', date: '18 Nov, 2026 04:20 PM', m: 'manual' },
  { id: 70, type: 'expense', amount: 210000, category: 'Makanan', description: 'Kopi & makan malam', wallet: 'bca', date: '17 Nov, 2026 08:00 PM', m: 'voice' }];
function parse(t, m) {
  const cat = s => /makan|kopi|minum|jajan|sarapan/i.test(s) ? 'Makanan' : /bensin|ojek|parkir|grab|gojek|tol/i.test(s) ? 'Transportasi' : /nonton|game|film|bioskop/i.test(s) ? 'Hiburan' : /listrik|internet|kos|pulsa|tagihan/i.test(s) ? 'Tagihan' : /belanja|beli/i.test(s) ? 'Belanja' : 'Lainnya';
  return t.split(/,|\bdan\b|\bkemudian\b|\blalu\b|\bserta\b/i).map(s => s.trim()).filter(Boolean).map(s => {
    s = s.replace(/(\d)\.(\d{3})/g, '$1$2'); const x = s.match(/(\d+(?:,\d+)?)\s*(ribu|rb|k|juta|jt)?/i); if (!x) return null;
    let n = parseFloat(x[1].replace(',', '.')), u = (x[2] || '').toLowerCase(); if (['ribu', 'rb', 'k'].includes(u)) n *= 1e3; else if (['juta', 'jt'].includes(u)) n *= 1e6; if (!(n > 0)) return null;
    const inc = /gaji|freelance|dapat uang|terima|bonus|uang masuk/i.test(s);
    const d = s.replace(x[0], '').replace(/\b(hari ini|tadi|saya|uang|rp)\b/gi, '').replace(/\s+/g, ' ').trim() || s;
    return { id: ++uid, type: inc ? 'income' : 'expense', amount: n, category: inc ? 'Pemasukan' : cat(s), description: d.charAt(0).toUpperCase() + d.slice(1), wallet: 'cash', date: nowS(), m };
  }).filter(Boolean);
}
const Dots = () => html`<span class="mu">${I('dots', 16)}</span>`;
const Stat = ({ l, v, ic, ac, bd, sub = 'bulan ini' }) => html`<div class=${'rounded-[16px] p-3.5 flex flex-col justify-between min-h-[110px] ' + (ac ? 'ac' : 'in')} style=${ac ? {} : { background: 'var(--in)' }}>
 <div class="flex justify-between items-start"><span class=${'text-[13px] ' + (ac ? '' : 'mu')}>${l}</span><span class="w-7 h-7 rounded-full flex items-center justify-center" style=${{ background: ac ? 'rgba(255,255,255,.25)' : 'var(--cd)' }}>${I(ic, 14)}</span></div>
 <div class="text-[22px] font-semibold mt-2">${v}</div><div class="flex items-center gap-1.5"><span class="badge">${bd}</span><span class=${'text-[10px] ' + (ac ? 'opacity-90' : 'mu')}>${sub}</span></div></div>`;
const Hatch = () => html`<defs><pattern id="h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fbd9c9"/><rect width="3.5" height="7" fill="#f26a2e"/></pattern></defs>`;
const Row = ({ t, sel, tg }) => html`<div class="row" style=${{ background: sel ? 'var(--in)' : 'transparent' }}>
 <input type="checkbox" class="cb hm" checked=${!!sel} onChange=${tg}/>
 <span class="hm mu">TRX_${String(t.id).padStart(6, '0')}</span>
 <span class="flex items-center gap-2 min-w-0"><span class="w-5 h-5 rounded-md in flex items-center justify-center text-[11px] shrink-0">${EM[t.category]}</span><span class="truncate"><span class="block truncate">${t.description}</span><span class="md:hidden mu text-[11px]">${t.date}</span></span></span>
 <span class="font-semibold text-right md:text-left" style=${{ color: t.type === 'income' ? '#1a9a4a' : 'inherit' }}>${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</span>
 <span class="hm flex items-center gap-1.5"><i class="w-1.5 h-1.5 rounded-full" style=${{ background: MC[t.m][0] }}></i>${MC[t.m][1]}</span>
 <span class="hm mu">${t.date}</span><span class="hm"><${Dots}/></span></div>`;
function Table({ txs, limit, full, initialPeriod = 'all', onViewAll }) {
  const [q, setQ] = useState(''), [f, setF] = useState('all'), [sel, setSel] = useState([73]), [period, setPeriod] = useState(initialPeriod);
  React.useEffect(() => { if (initialPeriod) setPeriod(initialPeriod); }, [initialPeriod]);
  const now = new Date();
  const byPeriod = txs.filter(t => {
    const d = parseTxDate(t.date);
    if (period === 'today') return isSameDay(d, now);
    if (period === 'week') return isSameWeek(d, now);
    if (period === 'month') return isSameMonth(d, now);
    return true;
  });
  const subInc = byPeriod.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const subExp = byPeriod.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const L = byPeriod.filter(t => (f === 'all' || t.type === f) && (t.description + t.category).toLowerCase().includes(q.toLowerCase())).slice(0, limit || 99);

  return html`<div class="cd h-full">
  <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
   <div>
    <b class="text-[15px] block">${full ? 'Riwayat Transaksi' : 'Aktivitas Terbaru'}</b>
    <span class="text-[11px] mu">${period === 'today' ? 'Aktivitas hari ini' : period === 'week' ? 'Aktivitas 7 hari terakhir' : period === 'month' ? 'Aktivitas bulan ini' : 'Semua aktivitas tercatat'}</span>
   </div>
   <div class="flex flex-wrap items-center gap-2">
    <div class="flex items-center gap-2 px-3 in pill"><span class="mu">${I('search', 15)}</span><input class="!bg-transparent !border-0 !p-0 !w-20 md:!w-32" placeholder="Cari" value=${q} onChange=${e => setQ(e.target.value)}/></div>
    <button class="b flex items-center gap-1.5" style=${{ border: '1px solid var(--bd)', background: 'var(--cd)' }} onClick=${() => setF(f === 'all' ? 'income' : f === 'income' ? 'expense' : 'all')}>${f === 'all' ? 'Semua' : f === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${I('filt', 14)}</button>
   </div>
  </div>

  <div class="flex items-center justify-between gap-2 mb-3 overflow-x-auto pb-1">
   <div class="flex items-center gap-1 p-1 in pill text-[11px]">
    ${[['all', 'Semua'], ['today', 'Hari Ini'], ['week', 'Minggu Ini'], ['month', 'Bulan Ini']].map(([k, l]) => html`
     <button key=${k} onClick=${() => setPeriod(k)} class=${'px-3 py-1 pill font-medium transition-colors ' + (period === k ? 'dk' : '')}>${l}</button>
    `)}
   </div>
   ${!full && onViewAll && html`<button class="text-[11px] mu font-semibold hover:underline" onClick=${onViewAll}>Lihat Semua →</button>`}
  </div>

  ${(period !== 'all' || full) && html`
   <div class="in p-2.5 mb-3 rounded-[12px] flex flex-wrap items-center justify-between gap-2 text-[12px]">
    <div class="flex items-center gap-2">
     <span class="w-2 h-2 rounded-full inline-block ${period === 'today' ? 'ac' : 'dk'}"></span>
     <b>${period === 'today' ? 'Rincian Hari Ini' : period === 'week' ? 'Rincian Minggu Ini' : period === 'month' ? 'Rincian Bulan Ini' : 'Ringkasan Filter'}</b>
     <span class="mu">(${byPeriod.length} transaksi)</span>
    </div>
    <div class="flex items-center gap-3">
     <span class="text-[#1a9a4a] font-semibold">+${fmt(subInc)}</span>
     <span class="text-[#d93025] font-semibold">-${fmt(subExp)}</span>
     <span class="mu font-medium">Net: <b style=${{ color: (subInc - subExp) >= 0 ? '#1a9a4a' : '#d93025' }}>${fmt(subInc - subExp)}</b></span>
    </div>
   </div>
  `}

  <div class="rounded-[14px] overflow-hidden" style=${{ border: '1px solid var(--bd)' }}>
   <div class="row th hm !border-0" style=${{ fontSize: 12 }}><span></span><span>ID Transaksi</span><span>Aktivitas</span><span>Nominal</span><span>Metode</span><span>Tanggal & Jam</span><span></span></div>
   ${L.map(t => html`<${Row} key=${t.id} t=${t} sel=${sel.includes(t.id)} tg=${() => setSel(sel.includes(t.id) ? sel.filter(x => x !== t.id) : [...sel, t.id])}/>`)}
   ${!L.length && html`<div class="mu text-center py-8">Tidak ada transaksi untuk filter ini.</div>`}
  </div>
 </div>`;
}
function Quick({ init, onClose, onSave }) {
  const isDirectType = init === 'income' || init === 'expense';
  const [tab, setTab] = useState(isDirectType ? 'manual' : init), [txt, setTxt] = useState(''), [res, setRes] = useState([]), [rec, setRec] = useState(false);
  const [f, setF] = useState({
    type: init === 'income' ? 'income' : 'expense',
    amount: '',
    category: init === 'income' ? 'Pemasukan' : 'Makanan',
    description: '',
    wallet: 'cash'
  });
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const mic = () => { if (!SR) return alert('Browser tidak mendukung speech recognition. Gunakan input teks.'); const r = new SR(); r.lang = 'id-ID'; r.onresult = e => setTxt(e.results[0][0].transcript); r.onend = () => setRec(false); r.onerror = () => setRec(false); setRec(true); r.start(); };
  const save = () => { const a = +f.amount; if (!(a > 0)) return alert('Nominal harus lebih besar dari nol'); onSave([{ ...f, id: ++uid, amount: a, date: nowS(), m: 'manual' }]); };
  return html`<div class="fixed inset-0 z-50 flex items-end md:items-center justify-center" style=${{ background: 'rgba(0,0,0,.45)' }} onClick=${onClose}>
 <div class="cd w-full md:max-w-lg max-h-[90vh] overflow-auto !rounded-b-none md:!rounded-b-[18px]" onClick=${e => e.stopPropagation()}>
 <div class="flex justify-between items-center mb-3"><b class="text-base">Quick Input</b><button class="mu text-lg" onClick=${onClose}>✕</button></div>
 <div class="in p-1 flex mb-4 pill">${[['manual', 'Manual'], ['ai', 'AI Chat'], ['voice', 'Voice']].map(([k, l]) => html`<button key=${k} onClick=${() => setTab(k)} class=${'flex-1 py-2 pill font-semibold ' + (tab === k ? 'dk' : '')}>${l}</button>`)}</div>
 ${tab === 'manual' ? html`<div class="grid grid-cols-2 gap-3"><select value=${f.type} onChange=${e => setF({ ...f, type: e.target.value })}><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select>
  <input type="number" placeholder="Nominal" value=${f.amount} onChange=${e => setF({ ...f, amount: e.target.value })}/>
  <select value=${f.category} onChange=${e => setF({ ...f, category: e.target.value })}>${CATS.map(c => html`<option key=${c}>${c}</option>`)}</select>
  <select value=${f.wallet} onChange=${e => setF({ ...f, wallet: e.target.value })}>${WAL.map(w => html`<option key=${w.id} value=${w.id}>${w.n}</option>`)}</select>
  <input class="col-span-2" placeholder="Deskripsi" value=${f.description} onChange=${e => setF({ ...f, description: e.target.value })}/><button class="b ac col-span-2" onClick=${save}>Simpan Transaksi</button></div>`
      : html`<div><textarea rows="3" placeholder=${tab === 'ai' ? 'Contoh: beli makan 20 ribu, bensin 25 ribu, dapat uang freelance 500 ribu' : 'Tekan mikrofon lalu bicara, atau ketik di sini'} value=${txt} onChange=${e => setTxt(e.target.value)}></textarea>
 <div class="flex gap-2 mt-3">${tab === 'voice' && html`<button class=${'b flex items-center gap-1.5 ' + (rec ? 'ac' : '')} onClick=${mic}>${I('mic', 15)}${rec ? 'Mendengarkan…' : 'Mikrofon'}</button>`}<button class="b dk flex-1" onClick=${() => setRes(parse(txt, tab === 'ai' ? 'ai_chat' : 'voice'))}>Ekstrak Transaksi</button></div>
 ${res.length > 0 && html`<div class="mt-4"><div class="mu mb-2">Periksa hasil ekstraksi sebelum disimpan:</div>${res.map(r => html`<div key=${r.id} class="in p-3 mb-2 flex items-center gap-2"><div class="flex-1 min-w-0"><div class="font-semibold truncate">${r.description}</div><div class="text-[11px] mu">${r.category} · ${r.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</div></div>
 <input class="!w-28" type="number" value=${r.amount} onChange=${e => setRes(res.map(x => x.id === r.id ? { ...x, amount: +e.target.value } : x))}/><button class="mu" onClick=${() => setRes(res.filter(x => x.id !== r.id))}>🗑</button></div>`)}
 <div class="flex gap-2 mt-3"><button class="b flex-1" onClick=${() => setRes([])}>Batal</button><button class="b ac flex-1" onClick=${() => onSave(res)}>Konfirmasi ${res.length}</button></div></div>`}</div>`}</div></div>`;
}
function Overview({ txs, tot, inc, exp, spent, open, go, goPeriod, toast }) {
  const [statPeriod, setStatPeriod] = useState('today');
  const now = new Date();
  const todayTxs = txs.filter(t => isSameDay(parseTxDate(t.date), now));
  const todayInc = todayTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const todayExp = todayTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const used = BUD.reduce((a, [c]) => a + (spent[c] || 0), 0), lim = BUD.reduce((a, b) => a + b[1], 0);
  const bal = w => w.b + txs.filter(t => t.wallet === w.id).reduce((a, t) => a + (t.type === 'income' ? t.amount : -t.amount), 0);

  return html`<div class="grid gap-3 lg:grid-cols-3">
   <div class="cd flex flex-col justify-between">
    <div>
     <div class="flex justify-between items-center"><span class="mu">Total Saldo</span><span class="in pill px-2.5 py-1 text-[11px] flex items-center gap-1">🇮🇩 IDR ${I('chev', 12)}</span></div>
     <div class="text-[26px] font-bold mt-1">${fmt(tot)}</div>
     <div class="mt-1"><span class="badge">↑ 5%</span> <span class="mu text-[11px]">dari bulan lalu</span></div>
     <div class="grid grid-cols-2 gap-2 mt-4">
      <button class="b dk flex items-center justify-center gap-1.5 !py-3 font-semibold transition-all hover:opacity-90 cursor-pointer" onClick=${() => open('income')}>
       ${I('plus', 14)} Pemasukan
      </button>
      <button class="b flex items-center justify-center gap-1.5 !py-3 font-semibold transition-all hover:opacity-90 cursor-pointer" style=${{ border: '1px solid var(--bd)', background: 'var(--cd)' }} onClick=${() => open('expense')}>
       ${I('plus', 14)} Pengeluaran
      </button>
     </div>
    </div>

    <div class="in p-2.5 mt-4">
     <div class="flex gap-2 text-[11px] mb-2"><b>Dompet</b><span class="mu">| Total ${WAL.length} dompet</span></div>
     <div class="grid grid-cols-3 gap-2">${WAL.slice(0, 3).map(w => html`<div key=${w.id} class="cd !p-2 !rounded-[10px]"><div class="flex justify-between items-center text-[10px] font-semibold"><span class="flex items-center gap-1"><i class="w-3.5 h-3.5 rounded-full ac inline-block"></i>${w.n}</span><${Dots}/></div><div class="font-bold text-[12px] mt-2 truncate">${fmt(bal(w))}</div><div class="text-[9px] mu mt-1 truncate">Saldo awal ${fmt(w.b)}</div><div class="text-[9px] mt-1" style=${{ color: w.on ? '#1a9a4a' : '#d93025' }}>${w.on ? 'Aktif' : 'Nonaktif'}</div></div>`)}</div>
    </div>
   </div>

   <div class="cd !p-2.5 flex flex-col justify-between">
    <div class="flex items-center justify-between px-1 mb-2">
     <span class="text-[12px] font-semibold flex items-center gap-1.5">
      <i class="w-2 h-2 rounded-full ac inline-block"></i>
      ${statPeriod === 'today' ? 'Ringkasan Hari Ini' : 'Ringkasan Bulan Ini'}
     </span>
     <div class="in p-0.5 flex pill text-[10px]">
      <button onClick=${() => setStatPeriod('today')} class=${'px-2.5 py-0.5 pill font-semibold transition-colors ' + (statPeriod === 'today' ? 'dk' : 'mu')}>Hari Ini</button>
      <button onClick=${() => setStatPeriod('month')} class=${'px-2.5 py-0.5 pill font-semibold transition-colors ' + (statPeriod === 'month' ? 'dk' : 'mu')}>Bulan Ini</button>
     </div>
    </div>
    <div class="grid grid-cols-2 gap-2 flex-1 content-stretch">
     <${Stat} ac=${true}
       l=${statPeriod === 'today' ? 'Pemasukan Hari Ini' : 'Total Pemasukan'}
       v=${fmt(statPeriod === 'today' ? todayInc : inc)}
       ic="wal"
       bd=${statPeriod === 'today' ? (todayTxs.filter(t => t.type === 'income').length + ' trx') : '↑ 7%'}
       sub=${statPeriod === 'today' ? 'hari ini' : 'bulan ini'}/>
     <${Stat}
       l=${statPeriod === 'today' ? 'Pengeluaran Hari Ini' : 'Total Pengeluaran'}
       v=${fmt(statPeriod === 'today' ? todayExp : exp)}
       ic="card"
       bd=${statPeriod === 'today' ? (todayTxs.filter(t => t.type === 'expense').length + ' trx') : '↑ 5%'}
       sub=${statPeriod === 'today' ? 'hari ini' : 'bulan ini'}/>
     <${Stat}
       l="Selisih Bersih"
       v=${fmt(statPeriod === 'today' ? (todayInc - todayExp) : (inc - exp))}
       ic="swap"
       bd=${statPeriod === 'today' ? 'Net' : '↑ 8%'}
       sub=${statPeriod === 'today' ? 'hari ini' : 'bulan ini'}/>
     <${Stat}
       l="Rasio Pengeluaran"
       v=${(statPeriod === 'today' ? (todayInc ? Math.round(todayExp / todayInc * 100) : 0) : (inc ? Math.round(exp / inc * 100) : 0)) + '%'}
       ic="pct"
       bd=${statPeriod === 'today' ? (todayTxs.length + ' trx') : '↑ 4%'}
       sub=${statPeriod === 'today' ? 'hari ini' : 'bulan ini'}/>
    </div>
   </div>

   <div class="cd"><div class="flex justify-between items-start"><div><b class="text-[15px]">Total Pemasukan</b><div class="mu text-[11px] mt-0.5">Lihat arus kas pada periode tertentu</div></div></div>
    <div class="flex justify-between items-center mt-2 text-[11px]"><b>Pemasukan & Pengeluaran</b><span class="flex gap-3 mu"><span class="flex items-center gap-1"><i class="w-1.5 h-1.5 rounded-full inline-block" style=${{ background: '#2f80ed' }}></i>Masuk</span><span class="flex items-center gap-1"><i class="w-1.5 h-1.5 rounded-full dk inline-block"></i>Keluar</span></span></div>
    <div style=${{ height: 190 }} class="mt-1"><${R.ResponsiveContainer} width="100%" height="100%"><${R.BarChart} data=${TREND} barCategoryGap="22%"><${Hatch}/><${R.CartesianGrid} vertical=${false} stroke="var(--bd)"/><${R.XAxis} dataKey="m" tick=${{ fontSize: 10, fill: '#8a8a8a' }} axisLine=${false} tickLine=${false}/><${R.YAxis} tick=${{ fontSize: 10, fill: '#8a8a8a' }} axisLine=${false} tickLine=${false} tickFormatter=${v => v + 'jt'} width=${30}/><${R.Tooltip} formatter=${v => 'Rp' + v + ' jt'} cursor=${false}/><${R.Bar} dataKey="Pengeluaran" stackId="a" fill="#1c1c1c" radius=${[0, 0, 4, 4]}/><${R.Bar} dataKey="Pemasukan" stackId="a" fill="url(#h)" radius=${[4, 4, 0, 0]}/><//><//></div></div>
   <div class="flex flex-col gap-3">
    <div class="cd"><b class="text-[14px]">Batas Anggaran Bulanan</b><div class="bar mt-4"><i style=${{ width: Math.min(100, used / lim * 100) + '%' }}></i></div><div class="flex justify-between mt-2 text-[11px]"><span><b>${fmt(used)}</b> <span class="mu">terpakai dari</span></span><b class="mu">${fmt(lim)}</b></div></div>
    <div class="cd flex-1"><div class="flex justify-between items-center mb-3"><b class="text-[14px] flex items-center gap-2"><span class="mu">${I('card', 16)}</span>Kartu Dompet</b><button class="b !py-1.5 !text-[11px] flex items-center gap-1" style=${{ border: '1px solid var(--bd)', background: 'var(--cd)' }} onClick=${() => open('manual')}>${I('plus', 12)} Tambah</button></div>
    <div class="flex gap-3 overflow-x-auto">${[WAL[0], WAL[3]].map((w, i) => html`<div key=${w.id} class=${'rounded-[14px] p-3 min-w-[200px] h-[120px] flex flex-col justify-between text-white ' + (i ? 'ac' : '')} style=${i ? {} : { background: '#1c1c1c' }}><div class="flex justify-between items-center"><span class="text-[10px] px-2 py-0.5 pill" style=${{ background: 'rgba(255,255,255,.22)' }}>${w.on ? 'Aktif' : 'Nonaktif'}</span><span class="flex"><i class="w-4 h-4 rounded-full inline-block" style=${{ background: '#eb001b' }}></i><i class="w-4 h-4 rounded-full inline-block -ml-1.5" style=${{ background: '#f79e1b' }}></i></span></div>
    <div><div class="font-bold text-[15px]">${w.n}</div><div class="text-[10px] opacity-80 mt-1">•••• •••• ${w.no} · ${fmt(bal(w))}</div></div></div>`)}</div></div></div>
   <div class="lg:col-span-2"><${Table} txs=${txs} limit=${5} onViewAll=${() => go('transaksi')}/></div>
  </div>`;
}
function AI({ txs, tot, inc, exp, spent, open }) {
  const [m, setM] = useState([{ r: 'a', c: 'Halo! Tanyakan kondisi keuangan Anda. Jawaban dihitung dari data transaksi aktual (misal: "Hari ini pengeluaran apa aja?", "Pendapatan hari ini berapa?", atau "Saldo").' }]), [v, setV] = useState('');
  const ans = q => {
    q = q.toLowerCase();
    const now = new Date();
    const todayList = (txs || []).filter(t => isSameDay(parseTxDate(t.date), now));
    const todayInc = todayList.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const todayExp = todayList.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    const tMax = Object.entries(spent).sort((a, b) => b[1] - a[1])[0];

    if (/hari ini|today/.test(q)) {
      if (/rincian|detail|apa (saja|aja)|daftar|buat apa|belanja apa/.test(q)) {
        if (!todayList.length) return 'Belum ada transaksi yang dicatat untuk hari ini.';
        const items = todayList.map(t => `• ${t.description}: ${t.type === 'income' ? '+' : '-'}${fmt(t.amount)} (${t.category}, ${t.wallet})`).join('\n');
        return `Rincian transaksi hari ini (${todayList.length} transaksi):\n${items}\n\nTotal Masuk: +${fmt(todayInc)}\nTotal Keluar: -${fmt(todayExp)}\nNet: ${fmt(todayInc - todayExp)}`;
      }
      if (/masuk|pemasukan|pendapatan|dapat/.test(q)) {
        return `Total pemasukan hari ini: +${fmt(todayInc)} (${todayList.filter(t => t.type === 'income').length} transaksi).`;
      }
      if (/keluar|pengeluaran|habis|belanja/.test(q)) {
        return `Total pengeluaran hari ini: -${fmt(todayExp)} (${todayList.filter(t => t.type === 'expense').length} transaksi).`;
      }
      return `Ringkasan hari ini:\n• Pemasukan: +${fmt(todayInc)}\n• Pengeluaran: -${fmt(todayExp)}\n• Selisih: ${fmt(todayInc - todayExp)}\n(${todayList.length} transaksi tercatat hari ini)`;
    }

    return /terbesar|kategori/.test(q) ? (tMax ? `Pengeluaran terbesar bulan ini: ${tMax[0]} (${fmt(tMax[1])}).` : 'Belum ada pengeluaran.') : /saldo/.test(q) ? `Total saldo seluruh dompet: ${fmt(tot)}.` : /pemasukan/.test(q) ? `Total pemasukan bulan ini: ${fmt(inc)}.` : /pengeluaran/.test(q) ? `Total pengeluaran bulan ini: ${fmt(exp)}.` : 'Saya dapat menjawab: pengeluaran/pendapatan hari ini beserta rinciannya, total saldo, pemasukan/pengeluaran bulanan, dan kategori terbesar.';
  };
  const send = () => { if (v.trim()) { setM([...m, { r: 'u', c: v }, { r: 'a', c: ans(v) }]); setV(''); } };
  return html`<div class="cd flex flex-col" style=${{ minHeight: '60vh' }}>
  <div class="flex-1 space-y-2.5 overflow-y-auto">
   ${m.map((x, i) => html`<div key=${i} class=${'max-w-[85%] p-3 rounded-2xl whitespace-pre-line ' + (x.r === 'u' ? 'ac ml-auto' : 'in')}>${x.c}</div>`)}
  </div>
  <div class="flex flex-wrap gap-1.5 mt-3 pt-2" style=${{ borderTop: '1px solid var(--bd)' }}>
   <button class="in px-2.5 py-1 text-[11px] pill mu hover:opacity-80" onClick=${() => setV('Pengeluaran hari ini apa aja?')}>💡 Pengeluaran hari ini apa aja?</button>
   <button class="in px-2.5 py-1 text-[11px] pill mu hover:opacity-80" onClick=${() => setV('Berapa pendapatan hari ini?')}>💡 Berapa pendapatan hari ini?</button>
   <button class="in px-2.5 py-1 text-[11px] pill mu hover:opacity-80" onClick=${() => setV('Berapa saldo seluruh dompet?')}>💡 Saldo dompet?</button>
  </div>
  <div class="flex gap-2 mt-2"><button class="ib" style=${{ background: 'var(--in)' }} onClick=${() => open('voice')}>${I('mic', 16)}</button><input placeholder="Tanya keuangan Anda (misal: rincian hari ini)…" value=${v} onChange=${e => setV(e.target.value)} onKeyDown=${e => e.key === 'Enter' && send()}/><button class="b ac" onClick=${send}>Kirim</button></div>
  <button class="text-[11px] mu mt-2 text-left" onClick=${() => open('ai')}>Catat transaksi lewat bahasa sehari-hari →</button></div>`;
}
const Budget = ({ spent }) => html`<div class="grid gap-3 md:grid-cols-2">${BUD.map(([c, a]) => { const u = spent[c] || 0, p = u / a * 100; return html`<div key=${c} class="cd"><div class="flex justify-between"><b>${EM[c]} ${c}</b><span class="mu">${Math.round(p)}%</span></div><div class="bar my-3"><i style=${{ width: Math.min(100, p) + '%', background: p > 85 ? '#d93025' : '' }}></i></div><div class="mu">Terpakai ${fmt(u)} · Sisa ${fmt(Math.max(0, a - u))}</div>${p > 85 && html`<div class="mt-2" style=${{ color: '#d93025' }}>⚠ Mendekati batas anggaran</div>`}</div>` })}</div>`;
const Goals = () => html`<div class="grid gap-3 md:grid-cols-2">${[['Dana Darurat', 5000000, 2300000], ['Laptop Baru', 12000000, 4800000]].map(([n, t, c]) => html`<div key=${n} class="cd"><div class="flex justify-between"><b>${n}</b><span class="mu">${Math.round(c / t * 100)}%</span></div><div class="bar my-3"><i style=${{ width: c / t * 100 + '%' }}></i></div><div class="mu">${fmt(c)} dari ${fmt(t)}</div></div>`)}</div>`;
const Report = ({ toast }) => html`<div class="cd"><b>Laporan Keuangan</b><p class="mu mt-1">Ekspor laporan harian, mingguan, bulanan, atau tahunan.</p><div class="flex gap-2 mt-3"><button class="b dk" onClick=${() => toast('Ekspor CSV tersedia setelah backend terhubung')}>Ekspor CSV</button><button class="b" onClick=${() => toast('Ekspor PDF tersedia setelah backend terhubung')}>Ekspor PDF</button></div></div>`;
const TABS = [['overview', 'Overview'], ['transaksi', 'Transaksi'], ['ai', 'AI Assistant'], ['anggaran', 'Anggaran'], ['target', 'Target'], ['laporan', 'Laporan']];
const RAIL = [['grid', 'overview'], ['cal', 'transaksi'], ['mail', 'ai'], ['doc', 'laporan'], ['users', 'target'], ['layers', 'anggaran'], ['cog', 'overview']];
function App() {
  const [tab, setTab] = useState('overview'), [txPeriod, setTxPeriod] = useState('all'), [txs, setTxs] = useState(T0), [modal, setModal] = useState(null), [msg, setMsg] = useState(''), [dark, setDark] = useState(false);
  const toast = m => { setMsg(m); setTimeout(() => setMsg(''), 2400) };
  const spent = useMemo(() => { const s = {}; txs.filter(t => t.type === 'expense').forEach(t => s[t.category] = (s[t.category] || 0) + t.amount); return s }, [txs]);
  const inc = txs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0), exp = txs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0), tot = WAL.reduce((a, w) => a + w.b, 0) + inc - exp;
  const save = l => { setTxs([...l, ...txs]); setModal(null); toast(l.length + ' transaksi disimpan'); };
  const theme = d => { setDark(d); document.documentElement.dataset.theme = d ? 'dark' : 'light' };
  const goPeriod = p => { setTxPeriod(p); setTab('transaksi'); };
  const P = { txs, tot, inc, exp, spent, open: setModal, go: setTab, goPeriod, toast };
  return html`<div class="p-2 md:p-4"><div class="fr p-3 md:p-5 md:flex md:gap-4 min-h-[calc(100vh-32px)]" style=${{ borderRadius: 24 }}>
 <aside class="hidden md:flex flex-col items-center gap-3 pt-14 w-11 shrink-0"><div class="cd !p-1 !rounded-full flex flex-col gap-1"><button class=${'ib ' + (!dark ? 'dk' : '')} onClick=${() => theme(false)}>${I('sun', 16)}</button><button class=${'ib ' + (dark ? 'dk' : '')} onClick=${() => theme(true)}>${I('moon', 16)}</button></div>
  <div class="cd !p-1 !rounded-full flex flex-col gap-1 mt-3">${RAIL.map(([i, k], ix) => html`<button key=${ix} class=${'ib ' + (ix === 0 && tab === k ? 'dk' : '')} onClick=${() => setTab(k)}>${I(i, 16)}</button>`)}</div>
  <div class="cd !p-1 !rounded-full flex flex-col gap-1 mt-auto"><button class="ib" onClick=${() => toast('Pusat bantuan')}>${I('help', 16)}</button><button class="ib" onClick=${() => toast('Logout (demo)')}>${I('out', 16)}</button></div></aside>
 <div class="flex-1 min-w-0">
  <header class="flex items-center justify-between gap-2 mb-5">
   <div class="cd !p-1.5 !pr-4 pill flex items-center gap-2 font-bold"><span class="w-8 h-8 pill ac flex items-center justify-center">${I('wal', 16)}</span>Vortex</div>
   <nav class="hidden lg:flex cd !p-1.5 pill gap-1">${TABS.map(([k, l]) => html`<button key=${k} onClick=${() => setTab(k)} class=${'px-4 py-2 pill font-medium ' + (tab === k ? 'dk' : '')}>${l}</button>`)}</nav>
   <div class="flex items-center gap-2"><div class="hidden md:flex cd !p-1.5 pill gap-1"><button class="ib" style=${{ background: 'var(--in)' }} onClick=${() => setModal('manual')}>${I('search', 15)}</button><button class="ib" style=${{ background: 'var(--in)' }} onClick=${() => toast('Tidak ada notifikasi baru')}>${I('bell', 15)}</button><button class="ib" style=${{ background: 'var(--in)' }} onClick=${() => setModal('voice')}>${I('mic', 15)}</button></div>
   <div class="cd !p-1.5 !pr-3 pill flex items-center gap-2"><span class="w-8 h-8 pill dk flex items-center justify-center font-bold">S</span><span class="hidden sm:block leading-tight"><b class="block">Sajibur Rahman</b><span class="mu text-[10px]">sajibur@mail.com</span></span><span class="mu">${I('chev', 14)}</span></div></div></header>
  <h1 class="text-[26px] md:text-[32px] font-semibold tracking-tight">${tab === 'overview' ? 'Selamat pagi, Sajibur' : TABS.find(t => t[0] === tab)[1]}</h1>
  <p class="mu mb-5 mt-1">Pantau tugas, progres, dan status keuangan Anda.</p>
  ${tab === 'overview' && React.createElement(Overview, P)}${tab === 'transaksi' && html`<${Table} txs=${txs} full=${true} initialPeriod=${txPeriod}/>`}${tab === 'ai' && React.createElement(AI, P)}${tab === 'anggaran' && React.createElement(Budget, P)}${tab === 'target' && html`<${Goals}/>`}${tab === 'laporan' && React.createElement(Report, P)}
 </div></div>
 <nav class="md:hidden fixed bottom-0 inset-x-0 cd !rounded-b-none flex justify-around items-center" style=${{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom,0px))' }}>
  ${[['overview', 'grid', 'Home'], ['transaksi', 'cal', 'Transaksi'], ['+'], ['ai', 'mail', 'AI'], ['anggaran', 'layers', 'Anggaran']].map(([k, i, l]) => k === '+' ? html`<button key=${k} class="ac w-12 h-12 pill -mt-8 shadow-lg flex items-center justify-center" onClick=${() => setModal('manual')}>${I('plus', 22)}</button>` : html`<button key=${k} onClick=${() => setTab(k)} class=${'flex flex-col items-center gap-0.5 text-[10px] ' + (tab === k ? 'font-bold' : 'mu')}>${I(i, 19)}${l}</button>`)}</nav>
 ${modal && html`<${Quick} init=${modal} onClose=${() => setModal(null)} onSave=${save}/>`}
 ${msg && html`<div class="fixed top-4 left-1/2 -translate-x-1/2 b dk z-50 shadow-lg">${msg}</div>`}</div>`;
}

export default App;
