'use client';

import React from 'react';
import Link from 'next/link';
import { Library, BookOpen, Heart, Clock, LayoutGrid, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0c0c0c] border-t border-zinc-200 dark:border-zinc-800/80 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/user" className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 p-1 shadow-lg shadow-red-600/10">
                <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-red-600 to-zinc-900 dark:from-red-500 dark:to-white bg-clip-text text-transparent">
                  peaceminusone-lib
                </span>
                <span className="ml-1.5 rounded bg-red-600/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-red-500 border border-red-500/20">
                  Siswa
                </span>
              </div>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Platform peminjaman buku digital siswa berkelas premium dengan ribuan koleksi berkualitas untuk mendukung literasi sekolah.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-55 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-500 hover:border-red-200 dark:hover:border-red-500/20 transition-all duration-300 hover:scale-105"
                title="GitHub"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" stroke="none">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-55 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-500 hover:border-red-200 dark:hover:border-red-500/20 transition-all duration-300 hover:scale-105"
                title="Instagram"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Navigasi Cepat</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/user', label: 'Katalog Buku', icon: BookOpen },
                { href: '/user/genres', label: 'Genre Buku', icon: LayoutGrid },
                { href: '/user/favorites', label: 'Buku Favorit', icon: Heart },
                { href: '/user/history', label: 'Riwayat Pinjam', icon: Clock }
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group text-xs font-semibold text-zinc-650 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-500 flex items-center gap-2 transition-colors"
                  >
                    <link.icon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-red-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Library Info / Jam Operasional */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Jam Operasional</h4>
            <div className="space-y-2 text-xs font-medium text-zinc-650 dark:text-zinc-400">
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                <span>Senin - Kamis</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">07:00 - 15:30</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                <span>Jumat</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">07:00 - 14:00</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Sabtu - Minggu</span>
                <span className="font-semibold text-rose-500/80">Tutup</span>
              </div>
            </div>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Kontak & Lokasi</h4>
            <ul className="space-y-2.5 text-xs text-zinc-650 dark:text-zinc-400 font-medium">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                <span>Gedung Perpustakaan Utama, Lt. 2, Jl. Pendidikan No. 45, Jakarta</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-red-600 dark:text-red-500 shrink-0" />
                <a href="mailto:perpus@sekolah.sch.id" className="hover:text-red-600 dark:hover:text-red-500 hover:underline">
                  perpus@sekolah.sch.id
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-red-600 dark:text-red-500 shrink-0" />
                <span>(021) 829-1029</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] font-semibold text-zinc-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} peaceminusone-lib. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">Ketentuan Layanan</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-red-600 dark:hover:text-red-500 transition-colors">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
