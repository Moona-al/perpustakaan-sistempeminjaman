'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, BookOpen, Receipt, LogOut, Library } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Master Data Buku', path: '/admin/books', icon: BookOpen },
    { name: 'Transaksi', path: '/admin/transactions', icon: Receipt },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl px-5 py-6 text-zinc-400 shadow-2xl">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-2 text-zinc-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
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
              <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'text-indigo-400 scale-105' : 'text-zinc-500 group-hover:text-zinc-200'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Profile Card & Logout */}
      <div className="mt-auto border-t border-zinc-800/60 pt-5 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900/30 rounded-xl border border-zinc-800/40">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-sm font-bold text-white border border-indigo-500/30">
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
    </aside>
  );
}
