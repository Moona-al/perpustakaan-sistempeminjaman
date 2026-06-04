'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Library, BookOpen, Clock, LogOut, Sun, Moon, Heart, LayoutGrid } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'SW';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 shadow-sm dark:shadow-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/user" className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 p-1 shadow-lg shadow-teal-600/10">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-teal-600 to-zinc-900 dark:from-teal-500 dark:to-white bg-clip-text text-transparent">
              peaceminusone-lib
            </span>
            <span className="ml-1.5 rounded bg-teal-600/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Siswa
            </span>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/user"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 border ${pathname === '/user'
                ? 'bg-teal-50 dark:bg-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30'
              }`}
          >
            <BookOpen className="h-4 w-4" />
            Katalog Buku
          </Link>

          <Link
            href="/user/genres"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 border ${pathname === '/user/genres'
                ? 'bg-teal-50 dark:bg-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30'
              }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Genre Buku
          </Link>

          <Link
            href="/user/favorites"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 border ${pathname === '/user/favorites'
                ? 'bg-teal-50 dark:bg-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30'
              }`}
          >
            <Heart className="h-4 w-4" />
            Buku Favorit
          </Link>

          <Link
            href="/user/history"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 border ${pathname === '/user/history'
                ? 'bg-teal-50 dark:bg-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30'
              }`}
          >
            <Clock className="h-4 w-4" />
            Riwayat Pinjam
          </Link>
        </nav>

        {/* Action Panel */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all duration-300 focus:outline-none"
            title={theme === 'dark' ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 animate-spin-slow text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {/* User Card */}
          <Link
            href="/user/profile"
            className="hidden sm:flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4 py-1 group/user hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer"
            title="Pengaturan Profil"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-600 text-xs font-bold text-white border border-teal-600/40 group-hover/user:bg-teal-500 transition-colors shadow-sm">
              {getInitials(user?.name || '')}
            </div>
            <div className="text-left leading-none">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover/user:text-teal-600 dark:group-hover/user:text-teal-500 transition-colors">
                {user?.name || 'Siswa'}
              </p>
              <p className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-500">Siswa Perpustakaan</p>
            </div>
          </Link>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400/90 transition-all duration-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/20"
            title="Keluar"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}

