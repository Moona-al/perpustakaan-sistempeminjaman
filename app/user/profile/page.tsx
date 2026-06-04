'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useBooks } from '@/context/BookContext';
import { useFavorites } from '@/context/FavoritesContext';
import Link from 'next/link';
import Toast from '@/components/Toast';
import {
  User, Lock, Shield, Calendar, BookOpen, Heart, Clock,
  Save, Eye, EyeOff, Loader2, Sparkles, UserCircle
} from 'lucide-react';

export default function UserProfilePage() {
  const { user, updateSession } = useAuth();
  const { theme } = useTheme();
  const { getBorrowedBooksForUser } = useBooks();
  const { favorites } = useFavorites();

  // Profile data state
  const [profile, setProfile] = useState<{
    id: number;
    name: string;
    username: string;
    class: string;
    role: string;
    created_at?: string;
  } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI States
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch full details from database on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.username) return;
      setIsFetching(true);
      try {
        const res = await fetch(`/api/auth/profile?username=${encodeURIComponent(user.username)}`);
        if (!res.ok) throw new Error('Gagal mengambil data profil');
        const data = await res.json();
        if (data.success && data.user) {
          setProfile(data.user);
          setName(data.user.name);
          setUsername(data.user.username);
          setPassword(data.user.password || '');
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setToast({ message: err.message || 'Gagal memuat profil', type: 'error' });
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [user?.username]);

  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'U';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!name.trim() || !username.trim()) {
      setToast({ message: 'Nama dan Username wajib diisi', type: 'error' });
      return;
    }

    if (username.trim().length < 3) {
      setToast({ message: 'Username minimal 3 karakter', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldUsername: user.username,
          name: name.trim(),
          username: username.toLowerCase().trim(),
          password: password || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui profil');

      if (data.success && data.user) {
        // Update frontend session state & migrate favorites if needed
        updateSession(data.user);

        // Update local profile state
        setProfile(prev => prev ? {
          ...prev,
          name: data.user.name,
          username: data.user.username
        } : null);

        setToast({ message: '✓ Profil berhasil diperbarui!', type: 'success' });
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setToast({ message: err.message || 'Gagal memperbarui profil', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Get current stats
  const activeLoans = user?.username ? getBorrowedBooksForUser(user.username).filter(l => l.status === 'borrowed' || l.status === 'late') : [];
  const totalFavs = favorites.length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-red-655 dark:text-red-500" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Memuat profil Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto min-h-screen pb-16 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-450 bg-clip-text text-transparent">
          Pengaturan Profil
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-550 mt-1.5">
          Lihat informasi detail akun Anda dan perbarui nama lengkap, username, atau kata sandi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Side: Avatar and Quick Stats Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 rounded-3xl p-6 shadow-sm dark:shadow-none flex flex-col items-center text-center relative overflow-hidden transition-all duration-300">
            {/* Visual glow background */}
            <div className="absolute top-[-30%] right-[-20%] h-40 w-40 rounded-full bg-teal-500/10 blur-3xl"></div>

            {/* Large Avatar */}
            <div className="relative mb-4">
              <div className="absolute -inset-1 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full blur opacity-30 animate-pulse" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-red-800 to-red-600 text-3xl font-black text-white border-2 border-white dark:border-zinc-900 shadow-xl">
                {profile ? getInitials(profile.name) : 'U'}
              </div>
            </div>

            <h3 className="font-extrabold text-lg text-zinc-955 dark:text-white leading-tight">{profile?.name}</h3>
            <p className="text-xs text-zinc-500 mt-1">@{profile?.username}</p>

            <span className="mt-3.5 inline-flex items-center gap-1 rounded-full bg-teal-600/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 border border-teal-500/25">
              <Shield className="h-3 w-3" /> {profile?.role === 'user' ? 'Siswa Perpustakaan' : 'Admin'}
            </span>

            {/* Extra Info */}
            <div className="w-full border-t border-zinc-150 dark:border-zinc-800/60 mt-6 pt-5 space-y-3 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 dark:text-zinc-500 font-semibold">Kelas</span>
                <span className="font-bold text-zinc-850 dark:text-zinc-200">{profile?.class || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 dark:text-zinc-500 font-semibold">Terdaftar</span>
                <span className="font-bold text-zinc-855 dark:text-zinc-200 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-zinc-400" />
                  {formatDate(profile?.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats mini cards */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/user/history"
              className="border border-zinc-200 dark:border-zinc-850 hover:border-red-500/30 bg-white dark:bg-zinc-900/20 p-4 rounded-2xl text-center shadow-sm dark:shadow-none hover:shadow transition-all duration-300 group"
            >
              <BookOpen className="h-5 w-5 text-indigo-500 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">Pinjaman Aktif</p>
              <p className="text-lg font-black text-zinc-850 dark:text-zinc-250 mt-0.5">{activeLoans.length}</p>
            </Link>

            <Link
              href="/user/favorites"
              className="border border-zinc-200 dark:border-zinc-850 hover:border-red-500/30 bg-white dark:bg-zinc-900/20 p-4 rounded-2xl text-center shadow-sm dark:shadow-none hover:shadow transition-all duration-300 group"
            >
              <Heart className="h-5 w-5 text-rose-500 mx-auto mb-1.5 group-hover:scale-110 transition-transform fill-rose-500/10 group-hover:fill-rose-500/20" />
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">Buku Favorit</p>
              <p className="text-lg font-black text-zinc-850 dark:text-zinc-250 mt-0.5">{totalFavs}</p>
            </Link>
          </div>
        </div>

        {/* Right Side: Edit Form Card */}
        <div className="md:col-span-2">
          <div className="border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-none transition-all duration-300">
            <h3 className="text-lg font-black text-zinc-955 dark:text-white mb-6 flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-red-600" /> Edit Detail Profil
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-405 block">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-650">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nama Lengkap Siswa"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-850 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-405 block">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-650">
                    <span className="text-xs font-bold font-mono">@</span>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="username"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-850 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all font-semibold"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold">
                  Username digunakan untuk masuk. Harus unik dan minimal 3 karakter.
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-405 block">
                  Kata Sandi Baru / Saat Ini
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-650">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Masukkan Kata Sandi"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl py-3 pl-10 pr-10 text-sm text-zinc-850 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-450 hover:text-zinc-800 dark:text-zinc-550 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Class Info (Readonly) */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-455 block">
                  Kelas (Non-Editable)
                </label>
                <input
                  type="text"
                  value={profile?.class || ''}
                  disabled
                  className="w-full bg-zinc-100 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800/40 rounded-xl py-3 px-4 text-sm text-zinc-500 dark:text-zinc-500 select-none cursor-not-allowed font-semibold"
                />
                <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold">
                  Kelas hanya dapat diubah oleh Administrator Perpustakaan.
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 py-3 text-xs font-extrabold text-white shadow-lg shadow-teal-600/10 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-wait cursor-pointer border border-transparent"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan Perubahan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Popup */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
