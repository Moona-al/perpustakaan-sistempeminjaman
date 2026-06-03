'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/Toast';
import { User, Lock, Library, ArrowRight, ShieldCheck, UserCheck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/user');
      }
    }
  }, [user, isLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setToast({ message: 'Username tidak boleh kosong.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay for premium feel
    setTimeout(() => {
      const success = login(username, password, role);
      setIsSubmitting(false);

      if (success) {
        setToast({ message: `Selamat datang, ${username}!`, type: 'success' });
      } else {
        if (role === 'admin') {
          setToast({ message: 'Username atau kata sandi admin salah (sandi: admin123).', type: 'error' });
        } else {
          setToast({ message: 'Username atau kata sandi siswa salah (sandi: user321).', type: 'error' });
        }
      }
    }, 800);
  };

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="relative flex flex-col items-center gap-4">
          {/* Glowing loader */}
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-800 border-t-indigo-500"></div>
          <p className="text-sm font-medium text-zinc-400 animate-pulse">Menghubungkan ke sistem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* Dynamic blurred glow spots */}
      <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-violet-600/15 blur-[120px] animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-indigo-600/15 blur-[120px] animate-pulse duration-[8000ms]"></div>
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[35rem] w-[35rem] rounded-full bg-pink-500/5 blur-[140px]"></div>

      {/* Main glass card */}
      <div className="w-full max-w-md border border-white/10 bg-zinc-900/60 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] relative z-10 hover:border-white/15 transition-all duration-500">
        
        {/* App Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4 group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-75 blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-xl">
              <Library className="h-8 w-8 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight">
            NET-PERPUS
          </h2>
          <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
            Sistem Informasi Perpustakaan Premium. Pinjam buku favorit dan kelola riwayat peminjaman secara digital.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role selector with high fidelity */}
          <div className="p-1 rounded-xl bg-zinc-950/80 border border-white/5 flex">
            <button
              type="button"
              onClick={() => { setRole('user'); setUsername(''); setPassword(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all duration-300 ${
                role === 'user'
                  ? 'bg-zinc-800/90 text-white shadow-lg border border-white/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Siswa (User)
            </button>
            <button
              type="button"
              onClick={() => { setRole('admin'); setUsername('admin'); setPassword(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all duration-300 ${
                role === 'admin'
                  ? 'bg-zinc-800/90 text-white shadow-lg border border-white/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Petugas (Admin)
            </button>
          </div>

          <div className="space-y-4">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === 'admin' ? 'admin' : 'Masukkan nama lengkap siswa'}
                  disabled={role === 'admin'}
                  className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl py-3.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Kata Sandi</label>
                {role === 'admin' && (
                  <span className="text-[10px] text-zinc-500 font-semibold bg-zinc-950/60 border border-white/5 px-2 py-0.5 rounded">Sandi: admin123</span>
                )}
                {role === 'user' && (
                  <span className="text-[10px] text-zinc-500 font-semibold bg-zinc-950/60 border border-white/5 px-2 py-0.5 rounded">Sandi: user321</span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/60 border border-zinc-800/80 rounded-xl py-3.5 pl-10 pr-11 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all"
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
            className="w-full relative group overflow-hidden rounded-xl py-3.5 font-bold text-sm shadow-xl active:scale-[0.98] transition-all disabled:opacity-85 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-colors"></div>
            <span className="relative flex items-center justify-center gap-2 text-white">
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              ) : (
                <>
                  Masuk ke Dasbor
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>
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

