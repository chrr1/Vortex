'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUpWithEmail, getSessionUser } from '@/lib/supabase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Jika sudah login, langsung ke dashboard
    getSessionUser().then((user) => {
      if (user) {
        router.replace('/');
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Silakan masukkan nama lengkap.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Kata sandi minimal 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        router.replace('/');
      } else {
        const data = await signUpWithEmail(email, password, fullName);
        if (data.session) {
          router.replace('/');
        } else {
          setSuccessMsg('Akun berhasil dibuat! Silakan periksa email Anda untuk verifikasi atau coba masuk.');
          setMode('signin');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Terjadi kesalahan saat autentikasi.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Email atau kata sandi tidak sesuai.';
      } else if (msg.includes('User already registered')) {
        msg = 'Email ini sudah terdaftar. Silakan masuk.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--tx)]">
        <div className="flex items-center gap-3 text-sm mu">
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          Memeriksa sesi...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[var(--bg)] text-[var(--tx)]">
      {/* Container Card */}
      <div className="w-full max-w-[420px] cd !p-6 md:!p-8 shadow-sm">
        {/* Brand / Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/new_icon.svg"
            alt="Dompetku Logo"
            className="w-14 h-14 rounded-2xl shadow-md mb-3 object-cover"
          />
          <h1 className="text-2xl font-bold tracking-tight">Dompetku</h1>
          <p className="text-xs mu mt-1 text-center">Kelola catatan keuangan dan asisten cerdas Anda</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 mb-5 rounded-full bg-[var(--in)] text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-full transition-all ${
              mode === 'signin' ? 'bg-[var(--cd)] text-[var(--tx)] shadow-sm' : 'mu'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-2 rounded-full transition-all ${
              mode === 'signup' ? 'bg-[var(--cd)] text-[var(--tx)] shadow-sm' : 'mu'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-start gap-2">
            <span className="font-bold">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-start gap-2">
            <span className="font-bold">✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold mu mb-1">NAMA LENGKAP</label>
              <input
                type="text"
                required
                placeholder="Contoh: Sajibur Rahman"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bd)] bg-[var(--in)] text-sm focus:outline-none focus:border-[var(--ac)] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold mu mb-1">EMAIL</label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bd)] bg-[var(--in)] text-sm focus:outline-none focus:border-[var(--ac)] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold mu mb-1">KATA SANDI</label>
            <input
              type="password"
              required
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bd)] bg-[var(--in)] text-sm focus:outline-none focus:border-[var(--ac)] transition-colors"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold mu mb-1">KONFIRMASI KATA SANDI</label>
              <input
                type="password"
                required
                placeholder="Ketik ulang kata sandi"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--bd)] bg-[var(--in)] text-sm focus:outline-none focus:border-[var(--ac)] transition-colors"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl dk text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : mode === 'signin' ? (
              'Masuk ke Akun'
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </form>

        {/* Demo mode link */}
        <div className="mt-6 pt-5 border-t border-[var(--bd)] text-center">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-xs mu hover:text-[var(--tx)] font-medium transition-colors"
          >
            ← Lanjutkan ke Dashboard (Mode Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
