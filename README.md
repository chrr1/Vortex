# Dompetku AI – Personal Finance Assistant (Frontend)

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Recharts. Hanya frontend dengan data dummy; belum ada backend/database.

## Menjalankan
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Deploy ke Vercel
Push ke GitHub → Import di Vercel → Deploy (tanpa konfigurasi tambahan).

## Struktur
- `src/components/FinanceApp.tsx` – seluruh UI (dashboard, Quick Input Manual/AI/Voice, tabel, chat AI, anggaran, target, laporan, tema terang/gelap)
- `src/app/globals.css` – token tema & gaya kustom
- `public/manifest.webmanifest` – dasar PWA (service worker belum ada)

## Langkah berikutnya (sesuai PRD)
Supabase Auth + RLS, Route Handlers, Gemini API + validasi Zod, ganti data dummy, pecah `FinanceApp.tsx` menjadi komponen kecil.
