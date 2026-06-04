'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '@/components/Toast';
import { User, Lock, Library, ArrowLeft, ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [className, setClassName] = useState('XII-RPL-1');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classes = [
    'X-RPL-1', 'X-RPL-2', 'XI-RPL-1', 'XI-RPL-2', 'XII-RPL-1', 'XII-RPL-2',
    'X-TKJ-1', 'X-TKJ-2', 'XI-TKJ-1', 'XI-TKJ-2', 'XII-TKJ-1', 'XII-TKJ-2'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setToast({ message: 'Nama lengkap tidak boleh kosong.', type: 'error' });
      return;
    }
    if (!username.trim()) {
      setToast({ message: 'Username tidak boleh kosong.', type: 'error' });
      return;
    }
    if (username.trim().length < 3) {
      setToast({ message: 'Username minimal 3 karakter.', type: 'error' });
      return;
    }
    if (!password.trim()) {
      setToast({ message: 'Kata sandi tidak boleh kosong.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase(),
          class: className,
          password: password,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok) {
        setToast({ message: 'Akun berhasil terdaftar! Mengalihkan...', type: 'success' });
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setToast({ message: data.error || 'Gagal mendaftar akun.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setToast({ message: 'Gagal menghubungi server.', type: 'error' });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* Dynamic blurred glow spots */}
      <div className="absolute top-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-rose-600/15 blur-[120px] animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-violet-600/15 blur-[120px] animate-pulse duration-[8000ms]"></div>
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[35rem] w-[35rem] rounded-full bg-indigo-500/5 blur-[140px]"></div>

      {/* Main glass card */}
      <div className="w-full max-w-md border border-white/10 bg-zinc-900/60 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] relative z-10 hover:border-white/15 transition-all duration-500">
        
        {/* App Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4 group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-600 to-violet-600 opacity-75 blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-xl p-2 border border-white/5">
              <img src="/logo.png" alt="peaceminusone-lib Logo" className="h-12 w-12 object-contain group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight">
            DAFTAR SISWA
          </h2>
          <p className="text-xs text-zinc-400 mt-2 max-w-xs leading-relaxed">
            Daftar akun perpustakaan baru untuk meminjam buku favorit Anda.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 pl-1">Nama Lengkap</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500 group-focus-within:text-rose-400 transition-colors">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl py-3.5 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-655 focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/30 transition-all"
                />
              </div>
            </div>

            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 pl-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500 group-focus-within:text-rose-400 transition-colors">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl py-3.5 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-655 focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/30 transition-all"
                />
              </div>
            </div>

            {/* Class Selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 pl-1">Kelas</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500 group-focus-within:text-rose-400 transition-colors">
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl py-3.5 pl-10 pr-4 text-xs text-zinc-200 focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/30 transition-all appearance-none cursor-pointer"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls} className="bg-zinc-900 text-zinc-200">
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 pl-1">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500 group-focus-within:text-rose-400 transition-colors">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl py-3.5 pl-10 pr-11 text-xs text-zinc-200 placeholder-zinc-655 focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 relative group overflow-hidden rounded-xl py-3.5 font-bold text-xs shadow-xl active:scale-[0.98] transition-all disabled:opacity-85 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-violet-600 hover:from-rose-500 hover:to-violet-500 transition-colors"></div>
            <span className="relative flex items-center justify-center gap-2 text-white">
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  Daftar Akun Baru
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-5 text-center border-t border-white/5 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-305 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Login
          </Link>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
