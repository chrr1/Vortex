// @ts-nocheck
'use client';
// Port dari prototipe: template htm dipertahankan agar tampilan identik. Pecah ke JSX/komponen kecil bertahap.
import React, { useState, useMemo, useEffect } from 'react';
import * as R from 'recharts';
import htm from 'htm';
import { createClient } from '@/lib/supabase/client';
import { getSessionUser, signOutUser } from '@/lib/supabase/auth';
import { fetchUserTransactions, insertTransaction, updateTransaction, deleteTransaction } from '@/lib/supabase/transactions';
import { fetchUserGoals, insertGoal, updateGoalAmount, deleteGoal } from '@/lib/supabase/goals';
import { fetchUserWallets, insertWallet, updateWallet, deleteWallet } from '@/lib/supabase/wallets';
import { fetchUserBudgets, upsertBudget } from '@/lib/supabase/budgets';
import { fetchCategories, insertCategory } from '@/lib/supabase/categories';
const html = htm.bind(React.createElement);
const I = (k, s = 18) => html`<svg width=${s} height=${s} aria-hidden="true"><use href=${'#' + k}/></svg>`;
const fmt = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
const CATS = ['Makanan', 'Transportasi', 'Hiburan', 'Belanja', 'Tagihan', 'Pemasukan', 'Lainnya'];
const CAT_ICONS = {
  Makanan: 'food',
  Transportasi: 'transport',
  Hiburan: 'entertainment',
  Belanja: 'shopping',
  Tagihan: 'bill',
  Pemasukan: 'income',
  Lainnya: 'other'
};
const CatIcon = (cat, s = 14) => I(CAT_ICONS[cat] || 'other', s);
const getWalletName = (tx, wallets = []) => {
  if (tx?.walletName) return tx.walletName;
  const tw = String(tx?.wallet || '').toLowerCase();
  const found = (wallets || []).find(w => String(w.id || '').toLowerCase() === tw || String(w.name || w.n || '').toLowerCase() === tw);
  if (found) return found.name || found.n;
  if (tx?.wallet && !/^[0-9a-f-]{20,}$/i.test(String(tx.wallet))) return tx.wallet;
  return 'Cash';
};
const WAL = [{ id: 'bca', n: 'BCA', b: 1500000, no: '6782', on: 1 }, { id: 'cash', n: 'Cash', b: 300000, no: '0001', on: 1 }, { id: 'dana', n: 'DANA', b: 250000, no: '4356', on: 1 }, { id: 'gopay', n: 'GoPay', b: 150000, no: '9120', on: 0 }];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu'];
const TREND = [[2.1, 1.6], [2.8, 1.4], [2.4, 1.2], [2.6, 1.7], [3.1, 1.5], [2.9, 2.1], [2.7, 1.8], [2.5, 1.6]].map((v, i) => ({ m: MON[i], Pengeluaran: v[0], Pemasukan: v[1] }));
const DEFAULT_BUDGETS = [
  { category_name: 'Makanan', amount: 500000 },
  { category_name: 'Transportasi', amount: 300000 },
  { category_name: 'Hiburan', amount: 200000 },
  { category_name: 'Belanja', amount: 800000 }
];
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
function parse(t, m, wallets = []) {
  const cat = s => /makan|kopi|minum|jajan|sarapan/i.test(s) ? 'Makanan' : /bensin|ojek|parkir|grab|gojek|tol/i.test(s) ? 'Transportasi' : /nonton|game|film|bioskop/i.test(s) ? 'Hiburan' : /listrik|internet|kos|pulsa|tagihan/i.test(s) ? 'Tagihan' : /belanja|beli/i.test(s) ? 'Belanja' : 'Lainnya';
  const detectWallet = s => {
    const lower = s.toLowerCase();
    const matched = (wallets || []).find(w => {
      const wn = String(w.name || w.n || '').toLowerCase();
      return wn && lower.includes(wn);
    });
    return matched ? (matched.id || matched.name || matched.n) : (wallets?.[0]?.id || 'cash');
  };
  return t.split(/,|\bdan\b|\bkemudian\b|\blalu\b|\bserta\b/i).map(s => s.trim()).filter(Boolean).map(s => {
    s = s.replace(/(\d)\.(\d{3})/g, '$1$2'); const x = s.match(/(\d+(?:,\d+)?)\s*(ribu|rb|k|juta|jt)?/i); if (!x) return null;
    let n = parseFloat(x[1].replace(',', '.')), u = (x[2] || '').toLowerCase(); if (['ribu', 'rb', 'k'].includes(u)) n *= 1e3; else if (['juta', 'jt'].includes(u)) n *= 1e6; if (!(n > 0)) return null;
    const inc = /gaji|freelance|dapat uang|terima|bonus|uang masuk/i.test(s);
    const d = s.replace(x[0], '').replace(/\b(hari ini|tadi|saya|uang|rp)\b/gi, '').replace(/\s+/g, ' ').trim() || s;
    const wId = detectWallet(s);
    const wObj = (wallets || []).find(w => (w.id || w.name || w.n) === wId);
    return { id: ++uid, type: inc ? 'income' : 'expense', amount: n, category: inc ? 'Pemasukan' : cat(s), description: d.charAt(0).toUpperCase() + d.slice(1), wallet: wId, walletName: wObj ? (wObj.name || wObj.n) : 'Cash', date: nowS(), m };
  }).filter(Boolean);
}
const Dots = () => html`<span class="mu">${I('dots', 16)}</span>`;
const Stat = ({ l, v, ic, ac, bd, sub = 'bulan ini', smallVal = false }) => html`<div class=${'rounded-[16px] p-3.5 flex flex-col justify-between min-h-[110px] ' + (ac ? 'ac' : 'in')} style=${ac ? {} : { background: 'var(--in)' }}>
 <div class="flex justify-between items-start"><span class=${'text-[13px] font-medium ' + (ac ? '' : 'mu')}>${l}</span><span class="w-7 h-7 rounded-full flex items-center justify-center" style=${{ background: ac ? 'rgba(255,255,255,.25)' : 'var(--cd)' }}>${I(ic, 14)}</span></div>
 <div class=${(smallVal ? 'text-[18px] md:text-[20px]' : 'text-[22px] md:text-[24px]') + ' font-bold tracking-tight mt-2 truncate'}>${v}</div><div class="flex items-center gap-1.5"><span class="badge">${bd}</span><span class=${'text-[10px] ' + (ac ? 'opacity-90' : 'mu')}>${sub}</span></div></div>`;
const Hatch = () => html`<defs><pattern id="h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fbd9c9"/><rect width="3.5" height="7" fill="#f26a2e"/></pattern></defs>`;
const Row = ({ t, sel, tg, wallets = [], onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const menuRef = React.useRef(null);
  const wName = getWalletName(t, wallets);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setConfirmDel(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return html`<div class="row relative" style=${{ background: sel ? 'var(--in)' : 'transparent' }}>
   <input type="checkbox" class="cb hm" checked=${!!sel} onChange=${tg}/>
   <span class="hm mu font-normal text-[10.5px]">TRX_${String(t.id).padStart(6, '0')}</span>
   <span class="flex items-center gap-2 min-w-0">
     <span class="w-5 h-5 rounded-md in flex items-center justify-center mu shrink-0">${CatIcon(t.category, 12)}</span>
     <span class="truncate min-w-0">
       <span class="block truncate font-medium text-xs">${t.description}</span>
       <span class="md:hidden mu text-[10px] font-normal flex items-center gap-1 truncate">
         <span class="inline-flex items-center gap-1 px-1.5 py-[1px] rounded in font-semibold text-[9.5px] text-[var(--tx)] shrink-0">
           <i class="w-1.5 h-1.5 rounded-full bg-[#f26a2e] inline-block"></i>${wName}
         </span>
         <span class="truncate">${t.date}</span>
       </span>
     </span>
   </span>
   <span class="hm min-w-0">
     <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full in text-[10.5px] font-semibold truncate max-w-full">
       <i class="w-1.5 h-1.5 rounded-full bg-[#f26a2e] shrink-0"></i>
       <span class="truncate">${wName}</span>
     </span>
   </span>
   <span class="font-bold text-right md:text-left text-xs md:text-[12.5px] truncate" style=${{ color: t.type === 'income' ? '#1a9a4a' : 'inherit' }}>${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</span>
   <span class="hm flex items-center gap-1.5 font-normal text-[10.5px]"><i class="w-1.5 h-1.5 rounded-full" style=${{ background: MC[t.m]?.[0] || '#2f80ed' }}></i>${MC[t.m]?.[1] || 'Manual'}</span>
   <span class="hm mu font-normal text-[10.5px] leading-tight">${t.date}</span>
   <div class="hm relative flex justify-end" ref=${menuRef}>
     <button type="button" class="mu opacity-70 hover:opacity-100 cursor-pointer p-0.5" onClick=${() => { setMenuOpen(!menuOpen); setConfirmDel(false); }} title="Aksi transaksi">
       <${Dots}/>
     </button>
     ${menuOpen && html`
       <div class="absolute right-0 top-full mt-1 w-32 cd !p-1 shadow-xl rounded-xl border border-[var(--bd)] z-40 flex flex-col gap-0.5 text-[11px]">
         ${onEdit && html`
           <button type="button" class="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--in)] font-medium" onClick=${() => { setMenuOpen(false); onEdit(t); }}>
             Edit
           </button>
         `}
         ${onDelete && html`
           <button type="button" class=${`w-full text-left px-2.5 py-1.5 rounded-lg font-medium ${confirmDel ? 'bg-red-500 text-white' : 'text-red-500 hover:bg-red-500/10'}`} onClick=${() => {
             if (!confirmDel) { setConfirmDel(true); return; }
             setMenuOpen(false);
             onDelete(t.id);
           }}>
             ${confirmDel ? 'Yakin Hapus?' : 'Hapus'}
           </button>
         `}
       </div>
     `}
   </div>
  </div>`;
};

function Table({ txs, limit, full, initialPeriod = 'all', onViewAll, wallets = [], onEditTx, onDeleteTx, onBulkDeleteTx, onOpenQuick }) {
  const [q, setQ] = useState(''), [f, setF] = useState('all'), [walletFilter, setWalletFilter] = useState('all'), [sel, setSel] = useState([]), [period, setPeriod] = useState(initialPeriod), [confirmBulk, setConfirmBulk] = useState(false);
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
  const L = byPeriod.filter(t => {
    const wName = getWalletName(t, wallets);
    const matchType = f === 'all' || t.type === f;
    const matchWallet = walletFilter === 'all' || wName.toLowerCase() === walletFilter.toLowerCase() || String(t.wallet || '').toLowerCase() === walletFilter.toLowerCase();
    const matchQ = (t.description + ' ' + t.category + ' ' + wName).toLowerCase().includes(q.toLowerCase());
    return matchType && matchWallet && matchQ;
  }).slice(0, limit || 99);

  const walletCycle = ['all', ...(wallets || []).map(w => w.name || w.n)];
  const cycleWallet = () => {
    const idx = walletCycle.findIndex(w => w.toLowerCase() === walletFilter.toLowerCase());
    setWalletFilter(walletCycle[(idx + 1) % walletCycle.length] || 'all');
  };

  return html`<div class="cd h-full">
  <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
   <div>
    <b class="text-sm block">${full ? 'Riwayat Transaksi' : 'Aktivitas Terbaru'}</b>
    <span class="text-[10.5px] mu">${period === 'today' ? 'Aktivitas hari ini' : period === 'week' ? 'Aktivitas 7 hari terakhir' : period === 'month' ? 'Aktivitas bulan ini' : 'Semua aktivitas tercatat'}</span>
   </div>
   <div class="flex flex-wrap items-center gap-1.5">
    <div class="flex items-center gap-1.5 px-2.5 py-1 in pill text-xs"><span class="mu">${I('search', 13)}</span><input class="!bg-transparent !border-0 !p-0 !w-20 md:!w-28 text-xs" placeholder="Cari" value=${q} onChange=${e => setQ(e.target.value)}/></div>
    ${walletCycle.length > 1 && html`
      <button type="button" class="b !py-1 !px-2.5 !text-xs flex items-center gap-1" style=${{ border: '1px solid var(--bd)', background: walletFilter === 'all' ? 'var(--cd)' : 'var(--in)' }} onClick=${cycleWallet} title="Filter dompet">
        <i class="w-1.5 h-1.5 rounded-full bg-[#f26a2e] inline-block"></i>
        ${walletFilter === 'all' ? 'Semua Dompet' : walletFilter}
      </button>
    `}
    <button type="button" class="b !py-1 !px-2.5 !text-xs flex items-center gap-1" style=${{ border: '1px solid var(--bd)', background: 'var(--cd)' }} onClick=${() => setF(f === 'all' ? 'income' : f === 'income' ? 'expense' : 'all')}>${f === 'all' ? 'Semua' : f === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${I('filt', 12)}</button>
   </div>
  </div>

  <div class="flex items-center justify-between gap-2 mb-2.5 overflow-x-auto pb-0.5">
   <div class="flex items-center gap-1 p-0.5 in pill text-[10.5px] shrink-0">
    ${[['all', 'Semua'], ['today', 'Hari Ini'], ['week', 'Minggu Ini'], ['month', 'Bulan Ini']].map(([k, l]) => html`
     <button key=${k} onClick=${() => setPeriod(k)} class=${'px-2.5 py-0.5 pill font-semibold transition-colors ' + (period === k ? 'dk' : 'mu hover:text-[var(--tx)]')}>${l}</button>
    `)}
   </div>
   <div class="flex items-center gap-2 shrink-0">
    ${sel.length > 0 && onBulkDeleteTx && html`
      <button type="button" class=${`px-2.5 py-1 rounded-full text-[10.5px] font-semibold transition ${confirmBulk ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-500'}`} onClick=${() => {
        if (!confirmBulk) { setConfirmBulk(true); setTimeout(() => setConfirmBulk(false), 3000); return; }
        onBulkDeleteTx(sel);
        setSel([]);
        setConfirmBulk(false);
      }}>
        ${confirmBulk ? `Yakin Hapus ${sel.length}?` : `Hapus ${sel.length} dipilih`}
      </button>
    `}
    ${!full && onViewAll && html`<button class="text-[11px] mu font-semibold hover:underline flex items-center gap-1" onClick=${onViewAll}>Lihat Semua ${I('arrow-right', 11)}</button>`}
   </div>
  </div>

  ${(period !== 'all' || full) && html`
   <div class="in p-2 mb-2.5 rounded-[12px] flex flex-wrap items-center justify-between gap-2 text-[11px]">
    <div class="flex items-center gap-1.5">
     <span class="w-1.5 h-1.5 rounded-full inline-block ${period === 'today' ? 'ac' : 'dk'}"></span>
     <b>${period === 'today' ? 'Rincian Hari Ini' : period === 'week' ? 'Rincian Minggu Ini' : period === 'month' ? 'Rincian Bulan Ini' : 'Ringkasan Filter'}</b>
     <span class="mu">(${byPeriod.length} transaksi)</span>
    </div>
    <div class="flex items-center gap-2.5 text-[11px]">
     <span class="text-[#1a9a4a] font-semibold">+${fmt(subInc)}</span>
     <span class="text-[#d93025] font-semibold">-${fmt(subExp)}</span>
     <span class="mu font-medium">Net: <b style=${{ color: (subInc - subExp) >= 0 ? '#1a9a4a' : '#d93025' }}>${fmt(subInc - subExp)}</b></span>
    </div>
   </div>
  `}

  <div class="rounded-[14px] overflow-visible" style=${{ border: '1px solid var(--bd)' }}>
   <div class="row th hm !border-0 !py-1.5 text-[10.5px] font-semibold !rounded-b-none" style=${{ color: 'var(--mu)' }}><span></span><span>ID Transaksi</span><span>Aktivitas</span><span>Dompet</span><span>Nominal</span><span>Metode</span><span>Tanggal & Jam</span><span></span></div>
   ${L.map(t => html`<${Row} key=${t.id} t=${t} wallets=${wallets} sel=${sel.includes(t.id)} tg=${() => setSel(sel.includes(t.id) ? sel.filter(x => x !== t.id) : [...sel, t.id])} onEdit=${onEditTx} onDelete=${onDeleteTx}/>`)}
   ${!L.length && html`
     <div class="mu text-center py-6 text-xs flex flex-col items-center gap-2">
       <span>Tidak ada transaksi untuk filter ini.</span>
       ${onOpenQuick && txs.length === 0 && html`<button type="button" class="b ac !py-1.5 !px-3 text-[11px]" onClick=${() => onOpenQuick('manual')}>+ Catat Transaksi Pertama</button>`}
     </div>
   `}
  </div>
 </div>`;
}
function CustomSelect({ value, options, onChange, iconRenderer, placeholder = 'Pilih' }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [open]);

  const selectedOpt = options.find(o => (typeof o === 'object' ? (o.id || o.value || o.name) === value : o === value));
  const selectedLabel = selectedOpt 
    ? (typeof selectedOpt === 'object' ? (selectedOpt.name || selectedOpt.label || selectedOpt.n) : selectedOpt)
    : placeholder;

  return html`
    <div class="relative w-full" ref=${ref}>
      <button
        type="button"
        onClick=${() => setOpen(!open)}
        class="w-full flex items-center justify-between in px-3 py-2.5 rounded-xl border border-[var(--bd)] text-xs font-semibold hover:border-gray-400 transition cursor-pointer select-none"
      >
        <span class="flex items-center gap-2 truncate">
          ${iconRenderer ? iconRenderer(value) : null}
          <span class="truncate">${selectedLabel}</span>
        </span>
        <span class=${`mu transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          ${I('chev', 12)}
        </span>
      </button>

      ${open && html`
        <div class="absolute left-0 right-0 top-full mt-1.5 cd p-1 shadow-2xl rounded-xl border border-[var(--bd)] z-50 max-h-48 overflow-y-auto flex flex-col gap-0.5">
          ${options.map(opt => {
            const val = typeof opt === 'object' ? (opt.id || opt.value || opt.name) : opt;
            const label = typeof opt === 'object' ? (opt.name || opt.label || opt.n) : opt;
            const isSelected = val === value;
            return html`
              <button
                key=${val}
                type="button"
                onClick=${() => { onChange(val); setOpen(false); }}
                class=${`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                  isSelected ? 'bg-[var(--in)] font-bold text-[var(--tx)]' : 'hover:bg-[var(--in)] text-[var(--tx)]'
                }`}
              >
                <span class="flex items-center gap-2 truncate">
                  ${iconRenderer ? iconRenderer(val) : null}
                  <span class="truncate">${label}</span>
                </span>
                ${isSelected ? html`<span class="text-[#f26a2e] font-bold">✓</span>` : null}
              </button>
            `;
          })}
        </div>
      `}
    </div>
  `;
}

function Quick({ init, editTx = null, onClose, onSave, wallets = [], categories = [] }) {
  const isEdit = !!editTx;
  const isDirectType = isEdit || init === 'income' || init === 'expense';
  const availableWallets = wallets && wallets.length > 0 ? wallets : WAL;
  const defaultWalletId = availableWallets[0]?.id || availableWallets[0]?.name || 'cash';
  const [tab, setTab] = useState(isDirectType ? 'manual' : init);
  const [txt, setTxt] = useState('');
  const [res, setRes] = useState([]);
  const [rec, setRec] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const [f, setF] = useState({
    type: editTx ? editTx.type : (init === 'income' ? 'income' : 'expense'),
    amount: editTx ? String(editTx.amount) : '',
    category: editTx ? editTx.category : (init === 'income' ? 'Pemasukan' : 'Makanan'),
    description: editTx ? editTx.description : '',
    wallet: editTx ? (editTx.wallet || defaultWalletId) : defaultWalletId
  });

  const availableCategories = (categories && categories.length > 0)
    ? categories.filter(c => f.type === 'income' ? c.type === 'income' : c.type === 'expense').map(c => c.name)
    : (f.type === 'income' ? ['Pemasukan', 'Investasi', 'Bonus', 'Gaji', 'Lainnya'] : ['Makanan', 'Transportasi', 'Hiburan', 'Belanja', 'Tagihan', 'Lainnya']);

  const quickAmounts = [20000, 50000, 100000, 250000, 500000];

  const handleQuickAdd = (amt) => {
    setErrMsg('');
    const cur = Number(f.amount || 0);
    setF({ ...f, amount: String(cur + amt) });
  };

  const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const mic = () => {
    setErrMsg('');
    if (!SR) return setErrMsg('Browser tidak mendukung speech recognition. Gunakan input teks.');
    const r = new SR();
    r.lang = 'id-ID';
    r.onresult = e => setTxt(e.results[0][0].transcript);
    r.onend = () => setRec(false);
    r.onerror = () => setRec(false);
    setRec(true);
    r.start();
  };

  const save = () => {
    const a = Number(f.amount);
    if (!a || a <= 0) return setErrMsg('Masukkan nominal transaksi yang lebih dari Rp0.');
    setErrMsg('');
    const wObj = availableWallets.find(w => (w.id || w.name || w.n) === f.wallet || (w.name || w.n) === f.wallet);
    const wName = wObj ? (wObj.name || wObj.n) : getWalletName({ wallet: f.wallet }, availableWallets);
    if (isEdit) {
      onSave({
        ...editTx,
        ...f,
        amount: a,
        walletName: wName,
        description: f.description.trim() || (f.type === 'income' ? 'Pemasukan' : f.category),
      }, true);
      return;
    }
    onSave([{
      ...f,
      id: ++uid,
      amount: a,
      walletName: wName,
      description: f.description.trim() || (f.type === 'income' ? 'Pemasukan' : f.category),
      date: nowS(),
      m: 'manual'
    }], false);
  };

  return html`
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style=${{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(3px)' }} onClick=${onClose}>
      <div class="cd w-full sm:max-w-[400px] max-h-[92vh] overflow-y-auto !rounded-b-none sm:!rounded-3xl p-4 sm:p-5 shadow-2xl relative" onClick=${e => e.stopPropagation()}>
        <div class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#f26a2e]"></span>
            <b class="text-sm sm:text-base font-bold">${isEdit ? 'Edit Transaksi' : 'Quick Input'}</b>
          </div>
          <button class="ib !w-7 !h-7 mu hover:opacity-80" onClick=${onClose}>
            ${I('close', 14)}
          </button>
        </div>

        <div class="in p-1 flex mb-3 pill text-xs">
          ${[['manual', 'Manual'], ['ai', 'AI Chat'], ['voice', 'Voice']].map(([k, l]) => html`
            <button
              key=${k}
              type="button"
              onClick=${() => setTab(k)}
              class=${`flex-1 py-1.5 pill font-semibold transition ${tab === k ? 'dk shadow-sm' : 'mu hover:text-[var(--tx)]'}`}
            >
              ${l}
            </button>
          `)}
        </div>

        ${tab === 'manual' ? html`
          <div>
            <!-- Segmented Pill Selector (Pengeluaran vs Pemasukan) -->
            <div class="grid grid-cols-2 p-1 in rounded-xl mb-3">
              <button
                type="button"
                onClick=${() => setF({ ...f, type: 'expense', category: f.category === 'Pemasukan' ? 'Makanan' : f.category })}
                class=${`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  f.type === 'expense' ? 'bg-[#ffefe8] text-[#e04f16] shadow-sm' : 'mu hover:text-[var(--tx)]'
                }`}
              >
                ${I('down', 13)} Pengeluaran
              </button>
              <button
                type="button"
                onClick=${() => setF({ ...f, type: 'income', category: 'Pemasukan' })}
                class=${`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  f.type === 'income' ? 'bg-[#e7f7ee] text-[#169d53] shadow-sm' : 'mu hover:text-[var(--tx)]'
                }`}
              >
                ${I('up', 13)} Pemasukan
              </button>
            </div>

            <!-- Hero Amount Display -->
            <div class="in p-3 rounded-2xl mb-2.5 flex flex-col items-center justify-center">
              <span class="text-[10px] mu uppercase tracking-wider font-semibold mb-1">Nominal Transaksi</span>
              <div class="flex items-center justify-center gap-1 w-full">
                <span class="text-base font-bold text-gray-400">Rp</span>
                <input
                  type="number"
                  placeholder="0"
                  value=${f.amount}
                  onChange=${e => setF({ ...f, amount: e.target.value })}
                  class="!bg-transparent !border-0 text-2xl font-black text-center !p-0 max-w-[190px] focus:ring-0 outline-none"
                  autoFocus
                />
              </div>
              ${Number(f.amount) > 0 && html`
                <div class="text-[11px] font-bold text-[#f26a2e] mt-1">${fmt(f.amount)}</div>
              `}
            </div>

            <!-- Quick Amount Chips -->
            <div class="flex items-center gap-1.5 mb-3 overflow-x-auto pb-0.5 no-scrollbar">
              ${quickAmounts.map(amt => html`
                <button
                  key=${amt}
                  type="button"
                  onClick=${() => handleQuickAdd(amt)}
                  class="px-2.5 py-1 text-[11px] font-semibold in rounded-full hover:bg-[var(--bd)] transition shrink-0"
                >
                  +${amt >= 1000 ? (amt / 1000) + 'rb' : amt}
                </button>
              `)}
              ${Number(f.amount) > 0 && html`
                <button
                  type="button"
                  onClick=${() => setF({ ...f, amount: '' })}
                  class="px-2 py-1 text-[11px] font-medium mu hover:text-red-500 shrink-0 ml-auto"
                >
                  Reset
                </button>
              `}
            </div>

            <!-- Custom Dropdowns: Kategori & Dompet -->
            <div class="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label class="block text-[10px] mu font-semibold mb-1">Kategori</label>
                <${CustomSelect}
                  value=${f.category}
                  options=${availableCategories}
                  onChange=${c => setF({ ...f, category: c })}
                  iconRenderer=${c => html`<span class="w-4 h-4 in rounded flex items-center justify-center shrink-0">${CatIcon(c, 11)}</span>`}
                  placeholder="Kategori"
                />
              </div>

              <div>
                <label class="block text-[10px] mu font-semibold mb-1">Dompet</label>
                <${CustomSelect}
                  value=${f.wallet}
                  options=${availableWallets}
                  onChange=${w => setF({ ...f, wallet: w })}
                  iconRenderer=${() => html`<span class="w-2 h-2 rounded-full bg-[#f26a2e] shrink-0"></span>`}
                  placeholder="Dompet"
                />
              </div>
            </div>

            <!-- Deskripsi -->
            <div class="mb-4">
              <label class="block text-[10px] mu font-semibold mb-1">Keterangan (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Kopi pagi, Makan siang, dll"
                value=${f.description}
                onChange=${e => setF({ ...f, description: e.target.value })}
                class="text-xs !py-2.5"
              />
            </div>

            <!-- Tombol Simpan -->
            ${errMsg && html`<div class="text-[11px] text-red-500 font-medium mb-2 text-center">${errMsg}</div>`}
            <button
              type="button"
              onClick=${save}
              class="b ac w-full !py-2.5 text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5"
            >
              ${isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </button>
          </div>
        ` : html`
          <div>
            <textarea
              rows="3"
              placeholder=${tab === 'ai' ? 'Contoh: beli makan 20 ribu, bensin 25 ribu, dapat uang freelance 500 ribu' : 'Tekan mikrofon lalu bicara, atau ketik di sini'}
              value=${txt}
              onChange=${e => setTxt(e.target.value)}
              class="text-xs mb-3"
            ></textarea>

            <div class="flex gap-2 mb-3">
              ${tab === 'voice' && html`
                <button
                  type="button"
                  class=${`b flex items-center gap-1.5 text-xs ${rec ? 'ac' : ''}`}
                  onClick=${mic}
                >
                  ${I('mic', 14)}
                  ${rec ? 'Mendengarkan…' : 'Mikrofon'}
                </button>
              `}
              <button
                type="button"
                class="b dk flex-1 text-xs"
                onClick=${() => {
                  const parsed = parse(txt, tab === 'ai' ? 'ai_chat' : 'voice', availableWallets);
                  if (!parsed.length) setErrMsg('Tidak ada nominal terdeteksi. Contoh: "makan 25rb pakai dana"');
                  else setErrMsg('');
                  setRes(parsed);
                }}
              >
                Ekstrak Transaksi
              </button>
            </div>
            ${errMsg && html`<div class="text-[11px] text-red-500 font-medium mb-2">${errMsg}</div>`}

            ${res.length > 0 && html`
              <div class="mt-3">
                <div class="mu text-xs mb-2">Periksa hasil ekstraksi:</div>
                ${res.map(r => html`
                  <div key=${r.id} class="in p-2.5 mb-2 rounded-xl flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 min-w-0">
                        <div class="font-semibold text-xs truncate">${r.description}</div>
                        <div class="text-[10px] mu flex items-center gap-1">
                          <span class="w-3.5 h-3.5 in rounded flex items-center justify-center">${CatIcon(r.category, 10)}</span>
                          ${r.category} · ${r.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </div>
                      </div>
                      <input
                        class="!w-24 text-xs !py-1 !px-2"
                        type="number"
                        value=${r.amount}
                        onChange=${e => setRes(res.map(x => x.id === r.id ? { ...x, amount: +e.target.value } : x))}
                      />
                      <button
                        type="button"
                        class="mu hover:text-red-500 p-1"
                        onClick=${() => setRes(res.filter(x => x.id !== r.id))}
                      >
                        ${I('trash', 14)}
                      </button>
                    </div>

                    <div class="grid grid-cols-2 gap-1.5">
                      <${CustomSelect}
                        value=${r.wallet || defaultWalletId}
                        options=${availableWallets}
                        onChange=${w => setRes(res.map(x => x.id === r.id ? { ...x, wallet: w } : x))}
                        placeholder="Dompet"
                      />
                      <${CustomSelect}
                        value=${r.category}
                        options=${availableCategories}
                        onChange=${c => setRes(res.map(x => x.id === r.id ? { ...x, category: c } : x))}
                        placeholder="Kategori"
                      />
                    </div>
                  </div>
                `)}
                <div class="flex gap-2 mt-3">
                  <button type="button" class="b flex-1 text-xs" onClick=${() => setRes([])}>Batal</button>
                  <button type="button" class="b ac flex-1 text-xs" onClick=${() => onSave(res)}>Konfirmasi ${res.length}</button>
                </div>
              </div>
            `}
          </div>
        `}
      </div>
    </div>
  `;
}
const DEFAULT_GOALS = [
  { id: 'g1', name: 'Dana Darurat', target_amount: 5000000, current_amount: 2300000, icon: 'target-icon' },
  { id: 'g2', name: 'Laptop Baru', target_amount: 12000000, current_amount: 4800000, icon: 'laptop' }
];

function Overview({ txs, tot, inc, exp, spent, open, go, goPeriod, toast, goals = [], wallets = [], budgets = [], onOpenAddGoal, onOpenWalletModal, onEditTx, onDeleteTx, onBulkDeleteTx }) {
  const [statPeriod, setStatPeriod] = useState('today');
  const now = new Date();
  const todayTxs = txs.filter(t => isSameDay(parseTxDate(t.date), now));
  const todayInc = todayTxs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const todayExp = todayTxs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const activeWallets = wallets.length > 0 ? wallets.map(w => ({ id: w.id || w.name.toLowerCase(), n: w.name, b: w.initial_balance || 0, on: w.is_active ? 1 : 0 })) : (txs.length > 0 ? WAL : []);
  const used = txs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  
  // Total batas anggaran bulanan dihitung dari tabel budgets jika ada
  const totalBudgetLimit = budgets.length > 0 ? budgets.reduce((a, b) => a + Number(b.amount || 0), 0) : 5000000;
  const lim = txs.length === 0 && budgets.length === 0 ? 0 : totalBudgetLimit;

  // Persentase komparasi dinamis (Bulan ini vs Bulan lalu)
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();
  const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
  const prevYear = curMonth === 0 ? curYear - 1 : curYear;

  const thisMonthInc = txs.filter(t => {
    const d = parseTxDate(t.date);
    return d.getFullYear() === curYear && d.getMonth() === curMonth && t.type === 'income';
  }).reduce((a, t) => a + t.amount, 0);

  const prevMonthInc = txs.filter(t => {
    const d = parseTxDate(t.date);
    return d.getFullYear() === prevYear && d.getMonth() === prevMonth && t.type === 'income';
  }).reduce((a, t) => a + t.amount, 0);

  const thisMonthExp = txs.filter(t => {
    const d = parseTxDate(t.date);
    return d.getFullYear() === curYear && d.getMonth() === curMonth && t.type === 'expense';
  }).reduce((a, t) => a + t.amount, 0);

  const prevMonthExp = txs.filter(t => {
    const d = parseTxDate(t.date);
    return d.getFullYear() === prevYear && d.getMonth() === prevMonth && t.type === 'expense';
  }).reduce((a, t) => a + t.amount, 0);

  const incChangePct = prevMonthInc > 0 ? Math.round(((thisMonthInc - prevMonthInc) / prevMonthInc) * 100) : 0;
  const expChangePct = prevMonthExp > 0 ? Math.round(((thisMonthExp - prevMonthExp) / prevMonthExp) * 100) : 0;
  const bal = w => {
    const base = w.b || w.initial_balance || 0;
    const wId = String(w.id || '').toLowerCase();
    const wName = String(w.n || w.name || '').toLowerCase();
    return base + txs.filter(t => {
      const tw = String(t.wallet || '').toLowerCase();
      return tw === wId || tw === wName;
    }).reduce((a, t) => a + (t.type === 'income' ? t.amount : -t.amount), 0);
  };

  // Dynamic monthly chart from real transactions
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const chartData = txs.length === 0 ? [] : monthNames.slice(0, Math.max(now.getMonth() + 1, 6)).map((m, idx) => {
    const mInc = txs.filter(t => {
      const d = parseTxDate(t.date);
      return d.getFullYear() === curYear && d.getMonth() === idx && t.type === 'income';
    }).reduce((a, t) => a + t.amount, 0);

    const mExp = txs.filter(t => {
      const d = parseTxDate(t.date);
      return d.getFullYear() === curYear && d.getMonth() === idx && t.type === 'expense';
    }).reduce((a, t) => a + t.amount, 0);

    return {
      m,
      Pengeluaran: mExp,
      Pemasukan: mInc,
      expJt: +(mExp / 1e6).toFixed(2),
      incJt: +(mInc / 1e6).toFixed(2)
    };
  });

  return html`<div class="grid gap-3 lg:grid-cols-3">
   <div class="cd flex flex-col justify-between">
    <div>
     <div class="flex justify-between items-center"><span class="mu">Total Saldo</span><span class="in pill px-2.5 py-1 text-[11px] flex items-center gap-1 font-medium">IDR ${I('chev', 12)}</span></div>
     <div class="text-[26px] font-bold mt-1">${fmt(tot)}</div>
     <div class="mt-1 flex items-center gap-1.5">
       <span class="badge flex items-center gap-1">${I(incChangePct >= 0 ? 'up' : 'down', 11)} ${Math.abs(incChangePct)}%</span> 
       <span class="mu text-[11px]">dari bulan lalu</span>
     </div>
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
     <div class="flex items-center justify-between text-[11px] mb-2">
       <div class="flex gap-2"><b>Dompet</b><span class="mu">| Total ${activeWallets.length} dompet</span></div>
       ${onOpenWalletModal && html`<button type="button" class="text-[10.5px] font-semibold text-[#f26a2e] hover:underline flex items-center gap-0.5 cursor-pointer" onClick=${() => onOpenWalletModal(null)}>${I('plus', 11)} Dompet</button>`}
     </div>
     ${activeWallets.length === 0 ? html`
       <div class="text-center py-3 text-[11px] mu">Belum ada dompet. Klik <b>+ Dompet</b> untuk menambahkan.</div>
     ` : html`
       <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">${activeWallets.map(w => html`<div key=${w.id} class="cd !p-2 !rounded-[10px]"><div class="flex justify-between items-center text-[10px] font-semibold"><span class="flex items-center gap-1 truncate"><i class="w-3 h-3 rounded-full ac inline-block shrink-0"></i><span class="truncate">${w.n}</span></span>${onOpenWalletModal ? html`<button type="button" class="mu hover:text-[var(--tx)] p-0.5 cursor-pointer" onClick=${() => onOpenWalletModal(w)} title="Kelola dompet"><${Dots}/></button>` : html`<${Dots}/>`}</div><div class="font-bold text-[12px] mt-2 truncate">${fmt(bal(w))}</div><div class="text-[9px] mu mt-1 truncate">Saldo awal ${fmt(w.b)}</div><div class="text-[9px] mt-1" style=${{ color: w.on ? '#1a9a4a' : '#d93025' }}>${w.on ? 'Aktif' : 'Nonaktif'}</div></div>`)}</div>
     `}
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
       smallVal=${true}
       ic="wal"
       bd=${statPeriod === 'today' ? (todayTxs.filter(t => t.type === 'income').length + ' trx') : (incChangePct >= 0 ? `↑ ${incChangePct}%` : `↓ ${Math.abs(incChangePct)}%`)}
       sub=${statPeriod === 'today' ? 'hari ini' : 'bulan ini'}/>
     <${Stat}
       l=${statPeriod === 'today' ? 'Pengeluaran Hari Ini' : 'Total Pengeluaran'}
       v=${fmt(statPeriod === 'today' ? todayExp : exp)}
       ic="card"
       bd=${statPeriod === 'today' ? (todayTxs.filter(t => t.type === 'expense').length + ' trx') : (expChangePct >= 0 ? `↑ ${expChangePct}%` : `↓ ${Math.abs(expChangePct)}%`)}
       sub=${statPeriod === 'today' ? 'hari ini' : 'bulan ini'}/>
     <${Stat}
       l="Selisih Bersih"
       v=${fmt(statPeriod === 'today' ? (todayInc - todayExp) : (inc - exp))}
       smallVal=${true}
       ic="swap"
       bd=${statPeriod === 'today' ? 'Net' : 'Bulan ini'}
       sub=${statPeriod === 'today' ? 'hari ini' : 'bulan ini'}/>
     <${Stat}
       l="Rasio Pengeluaran"
       v=${(statPeriod === 'today' ? (todayInc ? Math.round(todayExp / todayInc * 100) : 0) : (inc ? Math.round(exp / inc * 100) : 0)) + '%'}
       ic="pct"
       bd=${statPeriod === 'today' ? (todayTxs.length + ' trx') : (txs.length + ' trx')}
       sub=${statPeriod === 'today' ? 'hari ini' : 'bulan ini'}/>
    </div>
   </div>

   <div class="cd"><div class="flex justify-between items-start"><div><b class="text-[15px]">Arus Kas Bulanan</b><div class="mu text-[11px] mt-0.5">Lihat tren pemasukan & pengeluaran</div></div></div>
    <div class="flex justify-between items-center mt-2 text-[11px]"><b>Pemasukan & Pengeluaran</b><span class="flex gap-3 mu"><span class="flex items-center gap-1"><i class="w-1.5 h-1.5 rounded-full inline-block" style=${{ background: '#2f80ed' }}></i>Masuk</span><span class="flex items-center gap-1"><i class="w-1.5 h-1.5 rounded-full dk inline-block"></i>Keluar</span></span></div>
    <div style=${{ height: 190 }} class="mt-1 flex items-center justify-center">
     ${chartData.length === 0 ? html`<div class="text-center mu text-xs py-10 flex flex-col items-center gap-2"><span>Belum ada data transaksi tercatat untuk grafik.</span><span class="text-[11px] opacity-70">Mulai catat transaksi untuk melihat grafik arus kas Anda.</span></div>` : html`
      <${R.ResponsiveContainer} width="100%" height="100%">
       <${R.BarChart} data=${chartData} barCategoryGap="22%">
        <${Hatch}/>
        <${R.CartesianGrid} vertical=${false} stroke="var(--bd)"/>
        <${R.XAxis} dataKey="m" tick=${{ fontSize: 10, fill: '#8a8a8a' }} axisLine=${false} tickLine=${false}/>
        <${R.YAxis} tick=${{ fontSize: 10, fill: '#8a8a8a' }} axisLine=${false} tickLine=${false} tickFormatter=${v => v >= 1e6 ? (v / 1e6).toFixed(0) + 'jt' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'rb' : v} width=${35}/>
        <${R.Tooltip} 
          contentStyle=${{ background: 'var(--cd)', border: '1px solid var(--bd)', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
          formatter=${(v, name) => [fmt(v), name]}
          cursor=${false}/>
        <${R.Bar} dataKey="Pengeluaran" stackId="a" fill="#1c1c1c" radius=${[0, 0, 4, 4]}/>
        <${R.Bar} dataKey="Pemasukan" stackId="a" fill="url(#h)" radius=${[4, 4, 0, 0]}/>
       <//>
      <//>
     `}
    </div></div>
   <div class="flex flex-col gap-3">
    <div class="cd"><b class="text-[14px]">Batas Anggaran Bulanan</b><div class="bar mt-4"><i style=${{ width: Math.min(100, used / lim * 100) + '%' }}></i></div><div class="flex justify-between mt-2 text-[11px]"><span><b>${fmt(used)}</b> <span class="mu">terpakai dari</span></span><b class="mu">${fmt(lim)}</b></div></div>
    <div class="cd flex-1 flex flex-col justify-between">
     <div>
      <div class="flex justify-between items-center mb-2.5">
       <b class="text-[14px] flex items-center gap-2"><span class="mu">${I('users', 16)}</span>Target Tabungan</b>
       <button class="text-[11px] mu font-semibold hover:underline" onClick=${() => go('target')}>Lihat Semua ${I('arrow-right', 12)}</button>
      </div>
      <div class="space-y-2.5">
       ${goals.slice(0, 3).map(g => {
         const pct = g.target_amount ? Math.min(100, Math.round(g.current_amount / g.target_amount * 100)) : 0;
         return html`<div key=${g.id || g.name} class="in p-2.5 rounded-[12px]">
          <div class="flex justify-between items-center text-[12px]">
           <span class="font-semibold flex items-center gap-1.5"><span class="w-5 h-5 in rounded flex items-center justify-center mu">${I(g.icon === 'laptop' || (g.name || '').toLowerCase().includes('laptop') ? 'laptop' : 'target-icon', 13)}</span>${g.name}</span>
           <span class="font-bold text-[11px]">${pct}%</span>
          </div>
          <div class="bar my-1.5" style=${{ height: 5 }}><i style=${{ width: pct + '%' }}></i></div>
          <div class="flex justify-between text-[10px] mu">
           <span>Terkumpul <b>${fmt(g.current_amount)}</b></span>
           <span>Target ${fmt(g.target_amount)}</span>
          </div>
         </div>`;
       })}
      </div>
     </div>
     <button class="b !py-2 !text-[11px] flex items-center justify-center gap-1.5 mt-2.5 w-full font-semibold" style=${{ border: '1px solid var(--bd)', background: 'var(--cd)' }} onClick=${onOpenAddGoal || (() => go('target'))}>
      ${I('plus', 12)} Tambah Target Baru
     </button>
    </div>
   </div>
   <div class="lg:col-span-2"><${Table} txs=${txs} wallets=${wallets} limit=${5} onViewAll=${() => go('transaksi')} onEditTx=${onEditTx} onDeleteTx=${onDeleteTx} onBulkDeleteTx=${onBulkDeleteTx} onOpenQuick=${open}/></div>
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
   <button class="in px-2.5 py-1 text-[11px] pill mu hover:opacity-80" onClick=${() => setV('Pengeluaran hari ini apa aja?')}>${I('bulb', 13)} Pengeluaran hari ini apa aja?</button>
   <button class="in px-2.5 py-1 text-[11px] pill mu hover:opacity-80" onClick=${() => setV('Berapa pendapatan hari ini?')}>${I('bulb', 13)} Berapa pendapatan hari ini?</button>
   <button class="in px-2.5 py-1 text-[11px] pill mu hover:opacity-80" onClick=${() => setV('Berapa saldo seluruh dompet?')}>${I('bulb', 13)} Saldo dompet?</button>
  </div>
  <div class="flex gap-2 mt-2"><button class="ib" style=${{ background: 'var(--in)' }} onClick=${() => open('voice')}>${I('mic', 16)}</button><input placeholder="Tanya keuangan Anda (misal: rincian hari ini)…" value=${v} onChange=${e => setV(e.target.value)} onKeyDown=${e => e.key === 'Enter' && send()}/><button class="b ac" onClick=${send}>Kirim</button></div>
  <button class="text-[11px] mu mt-2 text-left" onClick=${() => open('ai')}>Catat transaksi lewat bahasa sehari-hari ${I('arrow-right', 12)}</button></div>`;
}
function Budget({ spent, budgets = [], onSaveBudget, categories = [] }) {
  const [editingCat, setEditingCat] = useState(null);
  const [newAmount, setNewAmount] = useState('');

  const catList = categories.length > 0 ? categories.filter(c => c.type === 'expense').map(c => c.name) : ['Makanan', 'Transportasi', 'Hiburan', 'Belanja'];

  // Gabungkan budget dari database dengan kategori yang ada
  const budgetMap = {};
  budgets.forEach(b => {
    budgetMap[b.category_name] = b.amount;
  });

  const handleOpenEdit = (c, currentVal) => {
    setEditingCat(c);
    setNewAmount(String(currentVal || 0));
  };

  const handleSave = async (c) => {
    const val = Number(newAmount);
    if (isNaN(val) || val <= 0) return alert('Nominal anggaran harus lebih besar dari 0');
    await onSaveBudget(c, val);
    setEditingCat(null);
  };

  return html`<div class="space-y-4">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-base font-bold">Anggaran Kategori Bulanan</h2>
        <p class="text-xs mu">Atur batas pengeluaran untuk masing-masing kategori pengeluaran Anda.</p>
      </div>
    </div>
    <div class="grid gap-3 md:grid-cols-2">
      ${catList.map(c => {
        const a = budgetMap[c] || 0;
        const u = spent[c] || 0;
        const p = a > 0 ? Math.round(u / a * 100) : 0;
        const isEditing = editingCat === c;

        return html`<div key=${c} class="cd">
          <div class="flex justify-between items-center">
            <b class="flex items-center gap-1.5">
              <span class="w-6 h-6 in rounded flex items-center justify-center mu">${CatIcon(c, 13)}</span>
              ${c}
            </b>
            <div class="flex items-center gap-2">
              <span class="mu text-xs font-semibold">${p}%</span>
              <button class="in pill px-2 py-0.5 text-[10px] mu hover:opacity-80" onClick=${() => handleOpenEdit(c, a)}>
                ${a > 0 ? 'Ubah' : '+ Pasang'}
              </button>
            </div>
          </div>

          ${isEditing ? html`
            <div class="flex gap-2 my-2.5">
              <input type="number" class="flex-1 !py-1 text-xs" placeholder="Batas nominal" value=${newAmount} onChange=${e => setNewAmount(e.target.value)}/>
              <button class="b dk !py-1 !px-2.5 text-xs font-semibold" onClick=${() => handleSave(c)}>Simpan</button>
              <button class="b !py-1 !px-2 text-xs" onClick=${() => setEditingCat(null)}>Batal</button>
            </div>
          ` : html`
            <div class="bar my-3"><i style=${{ width: Math.min(100, p) + '%', background: p > 85 ? '#d93025' : '' }}></i></div>
            <div class="mu text-xs flex justify-between">
              <span>Terpakai <b>${fmt(u)}</b></span>
              <span>Batas ${a > 0 ? fmt(a) : 'Belum diatur'}</span>
            </div>
            ${p > 85 && a > 0 && html`<div class="mt-2 text-xs font-medium" style=${{ color: '#d93025' }}>⚠ Pengeluaran telah melebihi 85% batas anggaran</div>`}
          `}
        </div>`;
      })}
    </div>
  </div>`;
}

function Goals({ goals = [], onOpenAdd, onAddSavings, onDeleteGoal }) {
  const [topUpGoal, setTopUpGoal] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');

  const handleTopUpSubmit = async (g) => {
    const val = Number(topUpAmount);
    if (!val || val <= 0) return alert('Nominal harus lebih dari 0');
    await onAddSavings(g.id, val);
    setTopUpGoal(null);
    setTopUpAmount('');
  };

  return html`<div class="space-y-4">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-base font-bold">Target Tabungan & Impian</h2>
        <p class="text-xs mu">Pantau progres tabungan dan impian keuangan Anda secara riil.</p>
      </div>
      <button class="b dk !py-2 !px-3.5 !text-xs font-semibold flex items-center gap-1.5 shadow-sm" onClick=${onOpenAdd}>
        ${I('plus', 13)} Tambah Target
      </button>
    </div>

    ${goals.length === 0 ? html`
      <div class="cd text-center py-12 flex flex-col items-center justify-center gap-2">
        <div class="w-12 h-12 in rounded-full flex items-center justify-center mu">${I('target-icon', 24)}</div>
        <b class="text-sm">Belum Ada Target Tabungan</b>
        <p class="text-xs mu max-w-sm">Mulai buat target impian Anda, misalnya Dana Darurat, Gadget Baru, Liburan, atau Modal Usaha.</p>
        <button class="b dk !py-2 !px-4 !text-xs mt-2" onClick=${onOpenAdd}>+ Buat Target Pertama</button>
      </div>
    ` : html`
      <div class="grid gap-3 md:grid-cols-2">
        ${goals.map(g => {
          const pct = g.target_amount ? Math.min(100, Math.round(g.current_amount / g.target_amount * 100)) : 0;
          const isAchieved = g.status === 'achieved' || pct >= 100;
          const isToppingUp = topUpGoal === g.id;

          return html`<div key=${g.id || g.name} class="cd flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start">
                <b class="flex items-center gap-2 text-sm">
                  <span class="w-7 h-7 in rounded-lg flex items-center justify-center mu text-sm">
                    ${I(g.icon === 'laptop' || (g.name || '').toLowerCase().includes('laptop') ? 'laptop' : 'target-icon', 15)}
                  </span>
                  <div>
                    <div>${g.name}</div>
                    ${g.target_date && html`<div class="text-[10px] mu font-normal">Target: ${new Date(g.target_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</div>`}
                  </div>
                </b>
                <div class="flex items-center gap-1.5">
                  <span class=${'text-xs font-bold px-2 py-0.5 rounded-full ' + (isAchieved ? 'bg-[#1a9a4a]/15 text-[#1a9a4a]' : 'in mu')}>${pct}%</span>
                  <button class="mu hover:text-red-500 p-1" title="Hapus Target" onClick=${() => onDeleteGoal(g.id)}>${I('trash', 13)}</button>
                </div>
              </div>
              <div class="bar my-3"><i style=${{ width: pct + '%', background: isAchieved ? '#1a9a4a' : '' }}></i></div>
              <div class="flex justify-between text-xs mu">
                <span>Terkumpul <b class="text-[var(--fg)]">${fmt(g.current_amount)}</b></span>
                <span>Target ${fmt(g.target_amount)}</span>
              </div>
            </div>

            ${isToppingUp ? html`
              <div class="flex gap-2 mt-3 pt-3 border-t border-[var(--bd)]">
                <input type="number" class="flex-1 !py-1 text-xs" placeholder="Nominal tabungan" value=${topUpAmount} onChange=${e => setTopUpAmount(e.target.value)}/>
                <button class="b dk !py-1 !px-2.5 text-xs font-semibold" onClick=${() => handleTopUpSubmit(g)}>Simpan</button>
                <button class="b !py-1 !px-2 text-xs" onClick=${() => setTopUpGoal(null)}>Batal</button>
              </div>
            ` : html`
              <div class="flex justify-between items-center mt-3 pt-2.5 border-t border-[var(--bd)]">
                <span class="text-[10px] mu font-medium">${isAchieved ? '🎉 Target Tercapai!' : `Kurang ${fmt(Math.max(0, g.target_amount - g.current_amount))}`}</span>
                <button class="in pill px-2.5 py-1 text-xs font-semibold hover:opacity-80 flex items-center gap-1" onClick=${() => { setTopUpGoal(g.id); setTopUpAmount(''); }}>
                  ${I('plus', 11)} Tambah Tabungan
                </button>
              </div>
            `}
          </div>`;
        })}
      </div>
    `}
  </div>`;
}

function AddGoalModal({ onClose, onSave }) {
  const [f, setF] = useState({ name: '', target_amount: '', current_amount: '', target_date: '' });
  const [errMsg, setErrMsg] = useState('');
  const handleSubmit = () => {
    const target = Number(f.target_amount);
    if (!f.name.trim()) return setErrMsg('Nama target harus diisi.');
    if (!target || target <= 0) return setErrMsg('Nominal target harus lebih dari Rp0.');
    setErrMsg('');
    onSave({
      name: f.name.trim(),
      target_amount: target,
      current_amount: Number(f.current_amount) || 0,
      target_date: f.target_date || undefined
    });
  };

  return html`<div class="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 sm:p-4" style=${{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(2px)' }} onClick=${onClose}>
    <div class="cd w-full md:max-w-md max-h-[90vh] overflow-auto !rounded-b-none md:!rounded-3xl" onClick=${e => e.stopPropagation()}>
      <div class="flex justify-between items-center mb-4">
        <b class="text-base flex items-center gap-2">${I('target-icon', 16)} Tambah Target Tabungan</b>
        <button class="mu hover:opacity-80 p-1" onClick=${onClose}>${I('close', 16)}</button>
      </div>
      <div class="flex flex-col gap-3 text-xs">
        <div>
          <label class="block mb-1 font-semibold mu">Nama Target / Impian</label>
          <input class="w-full" placeholder="Misal: Dana Darurat, Laptop Baru, Liburan" value=${f.name} onChange=${e => setF({ ...f, name: e.target.value })}/>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block mb-1 font-semibold mu">Target Nominal (Rp)</label>
            <input type="number" class="w-full" placeholder="5000000" value=${f.target_amount} onChange=${e => setF({ ...f, target_amount: e.target.value })}/>
          </div>
          <div>
            <label class="block mb-1 font-semibold mu">Saldo Awal Terkumpul</label>
            <input type="number" class="w-full" placeholder="0" value=${f.current_amount} onChange=${e => setF({ ...f, current_amount: e.target.value })}/>
          </div>
        </div>
        <div>
          <label class="block mb-1 font-semibold mu">Target Selesai (Opsional)</label>
          <input type="date" class="w-full" value=${f.target_date} onChange=${e => setF({ ...f, target_date: e.target.value })}/>
        </div>
        ${errMsg && html`<div class="text-[11px] text-red-500 font-medium">${errMsg}</div>`}
        <div class="flex gap-2 mt-3 pt-2 border-t border-[var(--bd)]">
          <button class="b flex-1" onClick=${onClose}>Batal</button>
          <button class="b dk flex-1 font-semibold" onClick=${handleSubmit}>Simpan Target</button>
        </div>
      </div>
    </div>
  </div>`;
}

function WalletModal({ wallet, onClose, onSave, onDelete }) {
  const isEdit = !!wallet;
  const [name, setName] = useState(wallet ? (wallet.n || wallet.name || '') : '');
  const [balance, setBalance] = useState(wallet ? String(wallet.b ?? wallet.initial_balance ?? 0) : '0');
  const [isActive, setIsActive] = useState(wallet ? (wallet.on !== undefined ? !!wallet.on : !!wallet.is_active) : true);
  const [errMsg, setErrMsg] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return setErrMsg('Nama dompet harus diisi.');
    const numBal = Number(balance || 0);
    if (isNaN(numBal) || numBal < 0) return setErrMsg('Saldo awal tidak boleh negatif.');
    setErrMsg('');
    onSave({ name: name.trim(), initial_balance: numBal, is_active: isActive }, wallet?.id);
  };

  return html`<div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style=${{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(3px)' }} onClick=${onClose}>
    <div class="cd w-full sm:max-w-[380px] !rounded-b-none sm:!rounded-3xl p-4 sm:p-5 shadow-2xl" onClick=${e => e.stopPropagation()}>
      <div class="flex justify-between items-center mb-3">
        <b class="text-sm sm:text-base font-bold flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#f26a2e]"></span>${isEdit ? 'Kelola Dompet' : 'Tambah Dompet Baru'}</b>
        <button class="ib !w-7 !h-7 mu hover:opacity-80" onClick=${onClose}>${I('close', 14)}</button>
      </div>
      <div class="flex flex-col gap-3 text-xs">
        <div>
          <label class="block mb-1 font-semibold mu">Nama Dompet / Rekening</label>
          <input placeholder="Contoh: Cash, BRI, DANA, GoPay" value=${name} onChange=${e => setName(e.target.value)} autoFocus/>
        </div>
        <div>
          <label class="block mb-1 font-semibold mu">Saldo Awal (Rp)</label>
          <input type="number" placeholder="0" value=${balance} onChange=${e => setBalance(e.target.value)}/>
        </div>
        ${isEdit && html`
          <div class="flex items-center justify-between in p-2.5 rounded-xl">
            <span class="font-semibold">Status Dompet</span>
            <button type="button" onClick=${() => setIsActive(!isActive)} class=${`px-3 py-1 rounded-full text-[11px] font-bold transition ${isActive ? 'bg-[#e7f7ee] text-[#169d53]' : 'bg-red-500/10 text-red-500'}`}>
              ${isActive ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>
        `}
        ${errMsg && html`<div class="text-[11px] text-red-500 font-medium">${errMsg}</div>`}
        <div class="flex gap-2 mt-2 pt-2 border-t border-[var(--bd)]">
          ${isEdit && onDelete && html`
            <button type="button" class=${`b !px-3 ${confirmDel ? '!bg-red-500 !text-white' : 'text-red-500'}`} onClick=${() => {
              if (!confirmDel) { setConfirmDel(true); return; }
              onDelete(wallet.id);
            }}>
              ${confirmDel ? 'Yakin Hapus?' : I('trash', 14)}
            </button>
          `}
          <button type="button" class="b flex-1" onClick=${onClose}>Batal</button>
          <button type="button" class="b ac flex-1 font-bold" onClick=${handleSubmit}>Simpan</button>
        </div>
      </div>
    </div>
  </div>`;
}
const Report = ({ toast }) => html`<div class="cd"><b>Laporan Keuangan</b><p class="mu mt-1">Ekspor laporan harian, mingguan, bulanan, atau tahunan.</p><div class="flex gap-2 mt-3"><button class="b dk" onClick=${() => toast('Ekspor CSV tersedia setelah backend terhubung')}>Ekspor CSV</button><button class="b" onClick=${() => toast('Ekspor PDF tersedia setelah backend terhubung')}>Ekspor PDF</button></div></div>`;
const TABS = [['overview', 'Overview'], ['transaksi', 'Transaksi'], ['ai', 'AI Assistant'], ['anggaran', 'Anggaran'], ['target', 'Target'], ['laporan', 'Laporan']];
const RAIL = [['grid', 'overview'], ['cal', 'transaksi'], ['mail', 'ai'], ['doc', 'laporan'], ['users', 'target'], ['layers', 'anggaran'], ['cog', 'overview']];
function App() {
  const [tab, setTab] = useState('overview'), [txPeriod, setTxPeriod] = useState('all'), [txs, setTxs] = useState([]), [goals, setGoals] = useState([]), [wallets, setWallets] = useState([]), [budgets, setBudgets] = useState([]), [categories, setCategories] = useState([]), [modal, setModal] = useState(null), [editTx, setEditTx] = useState(null), [walletModal, setWalletModal] = useState(null), [goalModalOpen, setGoalModalOpen] = useState(false), [msg, setMsg] = useState(''), [dark, setDark] = useState(false);
  const [user, setUser] = useState(null), [userMenu, setUserMenu] = useState(false), [loadingAuth, setLoadingAuth] = useState(true), [loadingData, setLoadingData] = useState(false);
  const toast = m => { setMsg(m); setTimeout(() => setMsg(''), 2400) };

  const loadUserData = async (u) => {
    if (u) {
      setLoadingData(true);
      try {
        const [remoteTxs, remoteGoals, remoteWallets, remoteBudgets, remoteCats] = await Promise.all([
          fetchUserTransactions(),
          fetchUserGoals(),
          fetchUserWallets(),
          fetchUserBudgets(),
          fetchCategories(),
        ]);
        React.startTransition(() => {
          setTxs(remoteTxs || []);
          setGoals(remoteGoals || []);
          setWallets(remoteWallets && remoteWallets.length > 0 ? remoteWallets : []);
          setBudgets(remoteBudgets || []);
          setCategories(remoteCats || []);
          setLoadingData(false);
        });
      } catch (err) {
        console.error('Error loading user data:', err);
        setLoadingData(false);
      }
    } else {
      setTxs([]);
      setGoals([]);
      setWallets([]);
      setBudgets([]);
      setLoadingData(false);
    }
  };

  useEffect(() => {
    getSessionUser().then(u => {
      if (!u) {
        window.location.href = '/login';
        return;
      }
      setUser(u);
      setLoadingAuth(false);
      loadUserData(u);
    });

    try {
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = {
            id: session.user.id,
            email: session.user.email,
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Pengguna',
          };
          setUser(u);
          setLoadingAuth(false);
          loadUserData(u);
        } else {
          setUser(null);
          loadUserData(null);
          window.location.href = '/login';
        }
      });
      return () => subscription?.unsubscribe();
    } catch (e) {
      console.warn('Supabase auth state error:', e);
    }
  }, []);

  const spent = useMemo(() => { const s = {}; txs.filter(t => t.type === 'expense').forEach(t => s[t.category] = (s[t.category] || 0) + t.amount); return s }, [txs]);
  const inc = txs.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0), exp = txs.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const activeWalletsList = wallets.length > 0 ? wallets : (user ? [] : WAL);
  const tot = activeWalletsList.reduce((a, w) => a + (w.initial_balance || w.b || 0), 0) + inc - exp;

  // Optimistic UI updates untuk transaksi (tambah & edit)
  const save = async (l, isEdit = false) => {
    if (isEdit && l && !Array.isArray(l)) {
      const prevTxs = [...txs];
      setTxs(prev => prev.map(item => item.id === l.id ? l : item));
      setEditTx(null);
      toast('Transaksi diperbarui');
      if (user) {
        try {
          const updated = await updateTransaction(l.id, l);
          if (updated) {
            setTxs(prev => prev.map(item => item.id === l.id ? { ...item, wallet: updated.wallet_id || l.wallet, walletName: updated.wallets?.name || l.walletName } : item));
          }
        } catch (e) {
          console.error('Failed to update transaction:', e);
          setTxs(prevTxs);
          toast('Gagal memperbarui transaksi di cloud');
        }
      }
      return;
    }

    setTxs([...l, ...txs]);
    setModal(null);
    toast(l.length + ' transaksi disimpan');
    if (user) {
      for (const t of l) {
        try {
          const inserted = await insertTransaction(t);
          if (inserted && inserted.id) {
            setTxs(prev => prev.map(item => item.id === t.id ? {
              ...item,
              id: inserted.id,
              wallet: inserted.wallet_id || item.wallet,
              walletName: inserted.wallets?.name || item.walletName
            } : item));
          }
        } catch (e) {
          console.error('Failed to sync to Supabase:', e);
          toast('Gagal sinkronisasi transaksi ke cloud');
        }
      }
    }
  };

  const handleDeleteTx = async (txId) => {
    const prevTxs = [...txs];
    setTxs(prev => prev.filter(t => t.id !== txId));
    toast('Transaksi dihapus');
    if (user) {
      try {
        await deleteTransaction(txId);
      } catch (e) {
        console.error('Failed to delete transaction:', e);
        setTxs(prevTxs);
        toast('Gagal menghapus transaksi');
      }
    }
  };

  const handleBulkDeleteTx = async (ids) => {
    const prevTxs = [...txs];
    setTxs(prev => prev.filter(t => !ids.includes(t.id)));
    toast(ids.length + ' transaksi dihapus');
    if (user) {
      try {
        await Promise.all(ids.map(id => deleteTransaction(id)));
      } catch (e) {
        console.error('Failed to bulk delete transactions:', e);
        setTxs(prevTxs);
        toast('Sebagian transaksi gagal dihapus');
      }
    }
  };

  const handleSaveWallet = async (data, existingId) => {
    if (existingId) {
      const prevWallets = [...wallets];
      setWallets(prev => prev.map(w => w.id === existingId ? { ...w, ...data } : w));
      setWalletModal(null);
      toast('Dompet diperbarui');
      if (user) {
        try {
          await updateWallet(existingId, data);
        } catch (e) {
          console.error('Failed to update wallet:', e);
          setWallets(prevWallets);
          toast('Gagal memperbarui dompet');
        }
      }
      return;
    }

    try {
      if (user) {
        const created = await insertWallet(data.name, data.initial_balance);
        if (created) {
          setWallets(prev => [...prev, {
            id: created.id,
            user_id: created.user_id,
            name: created.name,
            account_number: created.account_number || '',
            initial_balance: Number(created.initial_balance || 0),
            currency: created.currency || 'IDR',
            is_active: created.is_active ?? true,
          }]);
        }
      } else {
        setWallets(prev => [...prev, { id: 'w_' + Date.now(), name: data.name, initial_balance: data.initial_balance, is_active: true }]);
      }
      setWalletModal(null);
      toast('Dompet baru ditambahkan');
    } catch (e) {
      console.error('Failed to insert wallet:', e);
      toast('Gagal menambah dompet');
    }
  };

  const handleDeleteWallet = async (walletId) => {
    const prevWallets = [...wallets];
    setWallets(prev => prev.filter(w => w.id !== walletId));
    setWalletModal(null);
    toast('Dompet dihapus');
    if (user) {
      try {
        await deleteWallet(walletId);
      } catch (e) {
        console.error('Failed to delete wallet:', e);
        setWallets(prevWallets);
        toast('Gagal menghapus dompet');
      }
    }
  };

  const handleSaveGoal = async (newGoalData) => {
    try {
      if (user) {
        const saved = await insertGoal(newGoalData);
        if (saved) {
          setGoals([...goals, {
            id: saved.id,
            name: saved.name,
            target_amount: Number(saved.target_amount),
            current_amount: Number(saved.current_amount || 0),
            target_date: saved.target_date,
            status: saved.status,
            icon: saved.name.toLowerCase().includes('laptop') ? '💻' : '🎯',
          }]);
        }
      } else {
        setGoals([...goals, { ...newGoalData, id: 'g' + Date.now() }]);
      }
      setGoalModalOpen(false);
      toast('Target tabungan berhasil dibuat');
    } catch (e) {
      toast('Gagal menyimpan target: ' + (e.message || 'Error'));
    }
  };

  const handleAddSavings = async (goalId, addedAmount) => {
    // Optimistic update
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current_amount: g.current_amount + addedAmount } : g));
    toast('Tabungan berhasil ditambahkan');
    try {
      if (user) {
        await updateGoalAmount(goalId, addedAmount);
      }
    } catch (e) {
      // Revert if error
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current_amount: g.current_amount - addedAmount } : g));
      toast('Gagal menambah tabungan: ' + (e.message || 'Error'));
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!confirm('Yakin ingin menghapus target ini?')) return;
    const prevGoals = [...goals];
    // Optimistic update
    setGoals(prev => prev.filter(g => g.id !== goalId));
    toast('Target tabungan dihapus');
    try {
      if (user) {
        await deleteGoal(goalId);
      }
    } catch (e) {
      setGoals(prevGoals);
      toast('Gagal menghapus target: ' + (e.message || 'Error'));
    }
  };

  const handleSaveBudget = async (categoryName, amount) => {
    const existing = budgets.find(b => b.category_name === categoryName);
    const prevBudgets = [...budgets];
    // Optimistic update
    if (existing) {
      setBudgets(prev => prev.map(b => b.category_name === categoryName ? { ...b, amount } : b));
    } else {
      setBudgets(prev => [...prev, { category_name: categoryName, amount, period: 'monthly' }]);
    }
    toast(`Anggaran ${categoryName} diperbarui`);
    try {
      if (user) {
        await upsertBudget(categoryName, amount);
      }
    } catch (e) {
      setBudgets(prevBudgets);
      toast('Gagal memperbarui anggaran: ' + (e.message || 'Error'));
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setUserMenu(false);
      toast('Berhasil keluar');
    } catch (e) {
      toast('Gagal logout: ' + (e.message || 'Error'));
    }
  };

  const theme = d => {
    setDark(d);
    document.documentElement.dataset.theme = d ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', d ? '#0b0b0c' : '#e6e6e6');
  };
  const goPeriod = p => { setTxPeriod(p); setTab('transaksi'); };
  const P = { 
    txs, 
    tot, 
    inc, 
    exp, 
    spent, 
    goals, 
    budgets,
    wallets: activeWalletsList, 
    open: setModal, 
    go: setTab, 
    goPeriod, 
    toast,
    onOpenAddGoal: () => setGoalModalOpen(true),
    onOpenWalletModal: w => setWalletModal(w ? { wallet: w } : { wallet: null }),
    onEditTx: tx => setEditTx(tx),
    onDeleteTx: handleDeleteTx,
    onBulkDeleteTx: handleBulkDeleteTx,
    onSaveBudget: handleSaveBudget,
    onAddSavings: handleAddSavings,
    onDeleteGoal: handleDeleteGoal,
    categories
  };

  const displayName = user ? (user.fullName || user.email?.split('@')[0] || 'Pengguna') : '';
  const initialLetter = (displayName ? displayName.charAt(0) : 'U').toUpperCase();

  if (loadingAuth) {
    return html`<div class="min-h-screen flex items-center justify-center p-4">
      <div class="flex flex-col items-center gap-3">
        <img src="/new_icon.svg" class="w-12 h-12 rounded-full animate-pulse" alt="Dompetku Logo" />
        <span class="text-xs mu font-medium">Memeriksa autentikasi...</span>
      </div>
    </div>`;
  }

  return html`<div class="p-2 md:p-4"><div class="fr p-3 md:p-5 md:flex md:gap-4 min-h-[calc(100vh-32px)]" style=${{ borderRadius: 24 }}>
 <aside class="hidden md:flex flex-col items-center gap-3 pt-14 w-11 shrink-0"><div class="cd !p-1 !rounded-full flex flex-col gap-1"><button class=${'ib ' + (!dark ? 'dk' : '')} onClick=${() => theme(false)}>${I('sun', 16)}</button><button class=${'ib ' + (dark ? 'dk' : '')} onClick=${() => theme(true)}>${I('moon', 16)}</button></div>
  <div class="cd !p-1 !rounded-full flex flex-col gap-1 mt-3">${RAIL.map(([i, k], ix) => html`<button key=${ix} class=${'ib ' + (ix === 0 && tab === k ? 'dk' : '')} onClick=${() => setTab(k)}>${I(i, 16)}</button>`)}</div>
  <div class="cd !p-1 !rounded-full flex flex-col gap-1 mt-auto"><button class="ib" onClick=${() => toast('Pusat bantuan')}>${I('help', 16)}</button><button class="ib" onClick=${user ? handleLogout : () => { window.location.href = '/login'; }}>${I('out', 16)}</button></div></aside>
 <div class="flex-1 min-w-0">
  <header class="flex items-center justify-between gap-2 mb-5">
   <div class="cd !py-1 !px-2.5 !pr-3.5 pill flex items-center gap-2 font-bold text-xs"><img src="/new_icon.svg" class="w-6 h-6 rounded-full object-cover" alt="Dompetku Logo" />Dompetku${loadingData && html`<span class="w-1.5 h-1.5 rounded-full bg-[var(--ac)] animate-ping ml-0.5" title="Menyinkronkan data..."></span>`}</div>
   <nav class="hidden lg:flex cd !py-1 !px-1.5 pill gap-0.5">${TABS.map(([k, l]) => html`<button key=${k} onClick=${() => setTab(k)} class=${'px-3 py-1.5 pill font-semibold text-xs transition ' + (tab === k ? 'dk shadow-sm' : 'mu hover:text-[var(--tx)]')}>${l}</button>`)}</nav>
   <div class="flex items-center gap-2"><div class="hidden md:flex cd !p-0.5 pill gap-0.5"><button class="ib !w-7 !h-7" style=${{ background: 'var(--in)' }} onClick=${() => setTab('transaksi')} title="Cari transaksi">${I('search', 13)}</button><button class="ib !w-7 !h-7" style=${{ background: 'var(--in)' }} onClick=${() => toast('Tidak ada notifikasi baru')}>${I('bell', 13)}</button><button class="ib !w-7 !h-7" style=${{ background: 'var(--in)' }} onClick=${() => setModal('voice')}>${I('mic', 13)}</button></div>
   
   <div class="relative">
    ${user ? html`
      <div class="cd !py-1 !px-1.5 !pr-3 pill flex items-center gap-1.5 cursor-pointer select-none" onClick=${() => setUserMenu(!userMenu)}>
        <span class="w-6 h-6 pill dk flex items-center justify-center font-bold text-[10px] uppercase">${initialLetter}</span>
        <span class="hidden sm:block leading-tight text-left">
          <b class="block text-[11px] font-bold truncate max-w-[110px]">${displayName}</b>
          <span class="mu text-[9px] truncate max-w-[110px] block">${user.email}</span>
        </span>
        <span class="mu">${I('chev', 12)}</span>
      </div>
      ${userMenu && html`
        <div class="absolute right-0 mt-2 w-48 cd !p-2 shadow-lg z-50 rounded-2xl flex flex-col gap-1 text-xs">
          <div class="px-3 py-2 border-b border-[var(--bd)]">
            <div class="font-bold truncate">${displayName}</div>
            <div class="mu text-[10px] truncate">${user.email}</div>
          </div>
          <button class="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--in)] flex items-center gap-2" onClick=${() => { setTab('laporan'); setUserMenu(false); }}>
            ${I('doc', 14)} Laporan
          </button>
          <button class="w-full text-left px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 flex items-center gap-2" onClick=${handleLogout}>
            ${I('out', 14)} Keluar
          </button>
        </div>
      `}
    ` : html`
      <a href="/login" class="b dk !py-2 !px-3.5 !text-xs font-semibold flex items-center gap-1.5 shadow-sm">
        Masuk / Daftar
      </a>
    `}
   </div>
   </div></header>
  <h1 class="text-[26px] md:text-[32px] font-semibold tracking-tight">${tab === 'overview' ? `Selamat pagi, ${displayName}` : TABS.find(t => t[0] === tab)[1]}</h1>
  <p class="mu mb-5 mt-1">Pantau tugas, progres, dan status keuangan Anda.</p>
  ${tab === 'overview' && React.createElement(Overview, P)}${tab === 'transaksi' && html`<${Table} txs=${txs} wallets=${activeWalletsList} full=${true} initialPeriod=${txPeriod} onEditTx=${tx => setEditTx(tx)} onDeleteTx=${handleDeleteTx} onBulkDeleteTx=${handleBulkDeleteTx} onOpenQuick=${setModal}/>`}${tab === 'ai' && React.createElement(AI, P)}${tab === 'anggaran' && React.createElement(Budget, P)}${tab === 'target' && React.createElement(Goals, { goals, onOpenAdd: () => setGoalModalOpen(true), onAddSavings: P.onAddSavings, onDeleteGoal: P.onDeleteGoal })}${tab === 'laporan' && React.createElement(Report, P)}
 </div></div>
 <nav class="md:hidden fixed bottom-0 inset-x-0 cd !rounded-b-none flex justify-around items-center" style=${{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom,0px))' }}>
  ${[['overview', 'grid', 'Home'], ['transaksi', 'cal', 'Transaksi'], ['+'], ['ai', 'mail', 'AI'], ['anggaran', 'layers', 'Anggaran']].map(([k, i, l]) => k === '+' ? html`<button key=${k} class="ac w-12 h-12 pill -mt-8 shadow-lg flex items-center justify-center" onClick=${() => setModal('manual')}>${I('plus', 22)}</button>` : html`<button key=${k} onClick=${() => setTab(k)} class=${'flex flex-col items-center gap-0.5 text-[10px] ' + (tab === k ? 'font-bold' : 'mu')}>${I(i, 19)}${l}</button>`)}</nav>
 ${(modal || editTx) && html`<${Quick} init=${modal || 'manual'} editTx=${editTx} wallets=${activeWalletsList} categories=${categories} onClose=${() => { setModal(null); setEditTx(null); }} onSave=${save}/>`}
 ${walletModal && html`<${WalletModal} wallet=${walletModal.wallet} onClose=${() => setWalletModal(null)} onSave=${handleSaveWallet} onDelete=${handleDeleteWallet}/>`}
 ${goalModalOpen && html`<${AddGoalModal} onClose=${() => setGoalModalOpen(false)} onSave=${handleSaveGoal}/>`}
 ${msg && html`<div class="fixed top-4 left-1/2 -translate-x-1/2 b dk z-50 shadow-lg">${msg}</div>`}</div>`;
}

export default App;
