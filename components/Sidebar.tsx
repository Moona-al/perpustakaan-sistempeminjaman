'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useBooks } from '@/context/BookContext';
import { LayoutDashboard, BookOpen, Receipt, LogOut, Library, Users, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { transactions } = useBooks();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Master Data Buku', path: '/admin/books', icon: BookOpen },
    { name: 'Transaksi', path: '/admin/transactions', icon: Receipt },
    { name: 'Daftar User', path: '/admin/users', icon: Users },
  ];

  // Close drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  const SidebarContent = () => (
    <div className="flex h-full flex-col px-5 py-6">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-2 text-zinc-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
          <Library className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            E-Perpus Admin
          </h1>
          <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">
            Control Console
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="mt-8 flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 border ${
                isActive
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/5'
                  : 'border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? 'text-indigo-400 scale-105' : 'text-zinc-500'}`} />
              <span className="flex-1">{item.name}</span>
              {item.path === '/admin' && pendingCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-black text-white shadow-md shadow-indigo-500/25 animate-pulse">
                  {pendingCount}
                </span>
              )}
              {item.path === '/admin/transactions' && pendingCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white shadow-md shadow-amber-500/25 animate-pulse">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Card & Logout */}
      <div className="mt-auto border-t border-zinc-800/60 pt-5 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900/30 rounded-xl border border-zinc-800/40">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-sm font-bold text-white border border-indigo-500/30">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="truncate text-sm font-bold text-zinc-200">{user?.name || 'Administrator'}</h2>
            <p className="truncate text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{user?.role || 'Admin'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-rose-400/90 transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar (lg and above) ─────────────────────────────── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-20 w-72 flex-col border-r border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl shadow-2xl text-zinc-400">
        <SidebarContent />
      </aside>

      {/* ── Mobile Top Bar ──────────────────────────────────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl px-4 h-14 shadow-lg">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
            <Library className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm text-zinc-100 tracking-tight">E-Perpus Admin</span>
        </div>

        {/* Hamburger + pending badge */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="relative flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
          aria-label="Buka menu"
        >
          <Menu className="h-4.5 w-4.5" />
          {pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-black text-white animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </header>

      {/* ── Mobile Drawer Overlay ───────────────────────────────────────── */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer Panel ─────────────────────────────────────────── */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-zinc-800/60 bg-zinc-950 shadow-2xl text-zinc-400 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 flex items-center justify-center h-8 w-8 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
          aria-label="Tutup menu"
        >
          <X className="h-4 w-4" />
        </button>

        <SidebarContent />
      </aside>
    </>
  );
}
