'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Library,
  BookOpen,
  Clock,
  LogOut,
  Sun,
  Moon,
  Heart,
  LayoutGrid,
  Menu,
  X,
  User,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tutup drawer saat route berubah
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Kunci scroll body saat drawer terbuka
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
      : 'SW';
  };

  const navLinks = [
    { href: '/user', label: 'Katalog Buku', icon: BookOpen },
    { href: '/user/genres', label: 'Genre Buku', icon: LayoutGrid },
    { href: '/user/favorites', label: 'Buku Favorit', icon: Heart },
    { href: '/user/history', label: 'Riwayat Pinjam', icon: Clock },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-20 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 shadow-sm dark:shadow-none">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Brand */}
          <Link href="/user" className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 p-1 shadow-lg shadow-teal-600/10">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-teal-600 to-zinc-900 dark:from-teal-500 dark:to-white bg-clip-text text-transparent">
                peaceminusone-lib
              </span>
              <span className="ml-1.5 rounded bg-teal-600/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Siswa
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 border ${
                  pathname === href
                    ? 'bg-teal-50 dark:bg-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
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

            {/* User Card — desktop only */}
            <Link
              href="/user/profile"
              className="hidden md:flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4 py-1 group/user hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer"
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

            {/* Logout — desktop only */}
            <button
              onClick={logout}
              className="hidden md:flex items-center justify-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400/90 transition-all duration-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/20"
              title="Keluar"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer (slide-up from bottom) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden rounded-t-2xl border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* User Info */}
        <Link
          href="/user/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 mx-4 mt-2 mb-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 active:scale-[0.98] transition-transform"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white shadow-sm">
            {getInitials(user?.name || '')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">
              {user?.name || 'Siswa'}
            </p>
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Siswa Perpustakaan</p>
          </div>
          <User className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
        </Link>

        {/* Nav Links */}
        <nav className="px-4 pb-2 flex flex-col gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 border ${
                pathname === href
                  ? 'bg-teal-50 dark:bg-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20'
                  : 'text-zinc-600 dark:text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/50'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-4 my-1 border-t border-zinc-100 dark:border-zinc-800/80" />

        {/* Bottom Actions */}
        <div className="flex items-center gap-3 px-4 pt-2 pb-6">
          <button
            onClick={toggleTheme}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-500" />
                Mode Terang
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-indigo-500" />
                Mode Gelap
              </>
            )}
          </button>
          <button
            onClick={() => { setMobileOpen(false); logout(); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </div>
    </>
  );
}
