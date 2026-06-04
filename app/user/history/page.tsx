'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useBooks } from '@/context/BookContext';
import { Clock, Calendar, CheckCircle2, AlertCircle, BookOpen, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function StudentHistory() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { getBorrowedBooksForUser } = useBooks();

  // Retrieve user history from context
  const myLoans = getBorrowedBooksForUser(user?.username || '');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: 'borrowed' | 'returned' | 'late') => {
    switch (status) {
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Dikembalikan
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3 w-3" /> Terlambat
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" /> Sedang Dipinjam
          </span>
        );
    }
  };

  // Separate active loans and completed logs
  const activeLoans = myLoans.filter(l => l.status === 'borrowed' || l.status === 'late');
  const pastLoans = myLoans.filter(l => l.status === 'returned');

  // Accumulate total fines (active loans + returned history)
  const totalFines = myLoans.reduce((sum, current) => sum + current.fine, 0);

  return (
    <div className="space-y-8 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-650 dark:from-white dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent">
          Riwayat Peminjaman Saya
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-555 mt-1.5">
          Pantau status buku yang sedang Anda pinjam, batas waktu pengembalian, dan denda tertunggak.
        </p>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Total borrowed */}
        <div className="border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-5 rounded-2xl flex items-center gap-4 shadow-sm dark:shadow-none transition-all duration-300">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 rounded-xl">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Total Peminjaman</p>
            <p className="text-xl font-black text-zinc-800 dark:text-zinc-200 mt-0.5">{myLoans.length} Transaksi</p>
          </div>
        </div>

        {/* Active loans */}
        <div className="border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-5 rounded-2xl flex items-center gap-4 shadow-sm dark:shadow-none transition-all duration-300">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 rounded-xl">
            <Clock className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Sedang Dipinjam</p>
            <p className="text-xl font-black text-zinc-800 dark:text-zinc-200 mt-0.5">{activeLoans.length} Buku</p>
          </div>
        </div>

        {/* Total fines */}
        <div className="border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-5 rounded-2xl flex items-center gap-4 shadow-sm dark:shadow-none transition-all duration-300">
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/15 rounded-xl">
            <Receipt className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Akumulasi Denda</p>
            <p className={`text-xl font-black mt-0.5 ${totalFines > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
              Rp {totalFines.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Main List panels */}
      <div className="space-y-6">
        {/* SECTION 1: ACTIVE LOANS */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-amber-500 dark:text-amber-400" />
            Peminjaman Aktif
          </h2>
          {activeLoans.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {activeLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow transition-all duration-300"
                >
                  <div className="flex gap-4 items-center min-w-0">
                    <img
                      src={loan.coverImage}
                      alt={loan.bookTitle}
                      className="w-12 h-18 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shrink-0 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop";
                      }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-zinc-950 dark:text-zinc-100 truncate text-sm sm:text-base">
                        {loan.bookTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-zinc-500 dark:text-zinc-500 font-bold">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Dipinjam: {formatDate(loan.borrowDate)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Batas Pengembalian: {formatDate(loan.dueDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end border-t border-zinc-100 dark:border-zinc-800/60 sm:border-0 pt-3 sm:pt-0 shrink-0">
                    <div className="text-left sm:text-right">
                      {getStatusBadge(loan.status)}
                      {loan.fine > 0 && (
                        <p className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 mt-1">Denda: Rp {loan.fine.toLocaleString('id-ID')}</p>
                      )}
                    </div>

                    <Link
                      href={`/user/book/${loan.bookId}`}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer shadow-sm dark:shadow-none"
                    >
                      Lihat Buku
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl text-zinc-400 dark:text-zinc-500 text-xs bg-white dark:bg-transparent shadow-sm dark:shadow-none">
              Anda tidak sedang meminjam buku apa pun. Silakan telusuri katalog untuk meminjam buku.
            </div>
          )}
        </div>

        {/* SECTION 2: HISTORY LOGS */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            Riwayat Selesai
          </h2>
          {pastLoans.length > 0 ? (
            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 rounded-2xl p-5 shadow-sm dark:shadow-none transition-all duration-300">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-850 text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3">Buku</th>
                    <th className="pb-3">Tanggal Pinjam</th>
                    <th className="pb-3">Tanggal Kembali</th>
                    <th className="pb-3">Denda Dibayar</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {pastLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/10 transition-colors">
                      <td className="py-3.5 pr-3 font-extrabold text-zinc-900 dark:text-zinc-200 truncate max-w-[250px]" title={loan.bookTitle}>
                        {loan.bookTitle}
                      </td>
                      <td className="py-3.5 px-1 text-zinc-550 dark:text-zinc-400 text-xs">{formatDate(loan.borrowDate)}</td>
                      <td className="py-3.5 px-1 text-zinc-550 dark:text-zinc-400 text-xs">
                        {loan.returnDate ? formatDate(loan.returnDate) : '-'}
                      </td>
                      <td className="py-3.5 px-1 text-zinc-700 dark:text-zinc-300 text-xs font-bold">
                        {loan.fine > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-extrabold">Rp {loan.fine.toLocaleString('id-ID')}</span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500">Lunas / Nihil</span>
                        )}
                      </td>
                      <td className="py-3.5 pl-3 text-right">{getStatusBadge(loan.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl text-zinc-400 dark:text-zinc-500 text-xs bg-white dark:bg-transparent shadow-sm dark:shadow-none">
              Belum ada riwayat pengembalian buku yang selesai.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
