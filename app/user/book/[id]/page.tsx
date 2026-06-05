'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBooks, Book } from '@/context/BookContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Toast from '@/components/Toast';
import {
  ArrowLeft, Calendar, Clock, Landmark, Hash, CheckCircle,
  HelpCircle, FileText, BookMarked, Loader2, AlertTriangle, Hourglass
} from 'lucide-react';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;

  const { user } = useAuth();
  const { theme } = useTheme();
  const { books: localBooks, transactions, isBookAvailable, borrowBook } = useBooks();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(7);

  useEffect(() => {
    if (!bookId) return;

    const load = async () => {
      setIsLoading(true);
      setError(false);

      // 1. Try local context first (seeded + admin custom)
      const found = localBooks.find(b => b._id === bookId);
      if (found) {
        setBook(found);
        setIsLoading(false);
        return;
      }

      // 2. Fallback: fetch from Bukuacak API
      try {
        const res = await fetch(`https://api.bukuacak.shabsolute.tech/api/v1/book/${bookId}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setBook(data);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [bookId, localBooks]);

  const handleBorrow = async () => {
    if (!user || !book) return;
    setIsBorrowing(true);
    await new Promise(r => setTimeout(r, 700));
    const result = await borrowBook(book._id, user.username, selectedDuration);
    setIsBorrowing(false);
    if (result.success) {
      setToast({ message: `✓ "${book.title}" berhasil dipinjam selama ${selectedDuration} hari!`, type: 'success' });
    } else {
      setToast({ message: result.message, type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 dark:border-zinc-800 border-t-indigo-500" />
          <p className="text-sm font-medium text-zinc-400 dark:text-zinc-505 animate-pulse">Memuat detail buku...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
        <HelpCircle className="h-14 w-14 text-zinc-400 dark:text-zinc-750 mb-4 animate-bounce" />
        <h2 className="text-xl font-black text-zinc-800 dark:text-zinc-200">Buku Tidak Ditemukan</h2>
        <p className="text-sm text-zinc-500 mt-2 max-w-xs leading-relaxed">
          Buku yang Anda cari mungkin telah dihapus atau tautan sudah kedaluwarsa.
        </p>
        <button
          onClick={() => router.push('/user')}
          className="mt-6 flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 px-5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 animate-pulse" /> Kembali ke Katalog
        </button>
      </div>
    );
  }

  const available = isBookAvailable(book._id);
  const activeTx = transactions.find(
    t => t.bookId === book._id && (t.status === 'borrowed' || t.status === 'late')
  );
  const pendingTx = transactions.find(
    t => t.bookId === book._id && t.status === 'pending'
  );
  // Check if current user is the borrower/requestor
  const borrowedByMe = activeTx?.studentUsername === user?.username;
  const pendingByMe = pendingTx?.studentUsername === user?.username;

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Back */}
      <button
        onClick={() => router.push('/user')}
        className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors group cursor-pointer focus:outline-none"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Katalog
      </button>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ─── Left: Cover + Borrow Panel ─── */}
        <div className="lg:col-span-1 flex flex-col items-center gap-5">
          {/* Cover */}
          <div className="relative w-56 h-80 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-300 dark:shadow-zinc-950/50">
            <img
              src={book.cover_image}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop';
              }}
            />
            {book.isCustom && (
              <span className="absolute top-3 left-3 bg-indigo-650 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase shadow">
                Admin
              </span>
            )}
          </div>

          {/* Availability + Borrow Action Panel */}
          <div className="w-full max-w-sm border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-5 rounded-2xl space-y-4 shadow-sm dark:shadow-none">
            <h3 className="font-extrabold text-zinc-800 dark:text-zinc-250 text-sm">Status &amp; Peminjaman</h3>

            {available ? (
              <>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-extrabold">
                  <CheckCircle className="h-4.5 w-4.5" /> Tersedia untuk Dipinjam
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                  Klik tombol di bawah untuk meminjam buku ini selama <strong className="text-zinc-700 dark:text-zinc-300">{selectedDuration} hari</strong>. Denda <strong className="text-zinc-700 dark:text-zinc-300">Rp 1.000/hari</strong> berlaku jika terlambat dikembalikan.
                </p>

                {/* Duration Selector */}
                <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-505">Durasi Peminjaman</label>
                  <div className="flex gap-2">
                    {[7, 14, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDuration(d)}
                        className={`flex-grow py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${selectedDuration === d
                            ? 'bg-indigo-600/10 border-indigo-500/35 text-indigo-600 dark:text-indigo-400'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-555 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                          }`}
                      >
                        {d} Hari
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleBorrow}
                  disabled={isBorrowing}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-550 hover:to-indigo-555 py-3 text-sm font-bold text-white shadow-lg active:scale-[0.97] transition-all disabled:opacity-70 disabled:cursor-wait cursor-pointer border border-transparent"
                >
                  {isBorrowing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                  ) : (
                    <><BookMarked className="h-4 w-4" /> Pinjam Buku Sekarang ({selectedDuration} Hari)</>
                  )}
                </button>
                </>
                ) : pendingByMe ? (
              <>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-extrabold animate-pulse">
                  <Hourglass className="h-4.5 w-4.5 animate-spin-slow" /> Menunggu Persetujuan
                </div>
                <div className="bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl p-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Tanggal Pengajuan</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{pendingTx ? formatDate(pendingTx.borrowDate) : '-'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Durasi Diajukan</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {pendingTx ? Math.round((new Date(pendingTx.dueDate).getTime() - new Date(pendingTx.borrowDate).getTime()) / 86400000) : 7} Hari
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                  Anda telah mengajukan peminjaman untuk buku ini. Silakan tunggu petugas perpustakaan untuk menyetujui permintaan Anda.
                </p>
              </>
            ) : pendingTx ? (
              <>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-455 text-sm font-extrabold">
                  <Hourglass className="h-4.5 w-4.5" /> Sedang Diproses Siswa Lain
                </div>
                <p className="text-[11px] text-zinc-555 dark:text-zinc-500 leading-relaxed font-semibold">
                  Buku ini sedang diajukan peminjaman oleh siswa lain ({pendingTx.studentName}) dan sedang menunggu persetujuan petugas perpustakaan.
                </p>
              </>
            ) : borrowedByMe ? (
              <>
                <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400 text-sm font-extrabold">
                  <BookMarked className="h-4.5 w-4.5" /> Sedang Anda Pinjam
                </div>
                <div className="bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/15 rounded-xl p-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Tanggal Pinjam</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{activeTx ? formatDate(activeTx.borrowDate) : '-'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>Batas Kembali</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{activeTx ? formatDate(activeTx.dueDate) : '-'}</span>
                  </div>
                  {(activeTx?.fine ?? 0) > 0 && (
                    <div className="flex justify-between text-rose-650 dark:text-rose-450 font-extrabold">
                      <span>Denda Berjalan</span>
                      <span>Rp {activeTx!.fine.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                  Kembalikan buku ke petugas perpustakaan sebelum batas waktu untuk menghindari denda denda keterlambatan.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-rose-655 dark:text-rose-455 text-sm font-extrabold">
                  <AlertTriangle className="h-4.5 w-4.5" /> Sedang Dipinjam Siswa Lain
                </div>
                <p className="text-[11px] text-zinc-555 leading-relaxed font-semibold">
                  Buku ini sedang dipinjam dan diperkirakan tersedia kembali pada:
                </p>
                {activeTx && (
                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-black text-zinc-800 dark:text-zinc-200 shadow-sm dark:shadow-none">
                    <Clock className="h-3.5 w-3.5 inline mr-1.5 text-zinc-400 dark:text-zinc-555" />
                    {formatDate(activeTx.dueDate)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ─── Right: Book Details ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="space-y-2.5">
            <span className="inline-block bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/15 rounded-md px-2.5 py-1 text-xs font-black uppercase tracking-wider">
              {book.category?.name || 'Lainnya'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-zinc-100 leading-tight">
              {book.title}
            </h1>
            <p className="text-sm text-zinc-500">
              Ditulis oleh <span className="font-bold text-indigo-600 dark:text-indigo-400">{book.author?.name}</span>
            </p>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-zinc-200 dark:border-zinc-800/80 py-5">
            {[
              { label: 'Penerbit', value: book.publisher || 'Gramedia', icon: <Landmark className="h-3.5 w-3.5" /> },
              { label: 'ISBN', value: book.details?.isbn || '-', icon: <Hash className="h-3.5 w-3.5" /> },
              { label: 'Halaman', value: book.details?.total_pages || '-', icon: <FileText className="h-3.5 w-3.5" /> },
              { label: 'Terbit', value: book.details?.published_date || '-', icon: <Calendar className="h-3.5 w-3.5" /> },
            ].map(item => (
              <div key={item.label} className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-650">{item.label}</span>
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 truncate">
                  <span className="text-zinc-400 dark:text-zinc-600">{item.icon}</span>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-300">Ringkasan Buku</h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify font-medium">
              {book.summary || 'Tidak ada ringkasan sinopsis untuk buku ini.'}
            </p>
          </div>

          {/* Extra Details */}
          {book.details && (
            <div className="space-y-2.5">
              <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-300">Informasi Koleksi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-xl shadow-sm dark:shadow-none">
                <p><span className="text-zinc-400 dark:text-zinc-600 font-semibold">Format:</span> <span className="text-zinc-800 dark:text-zinc-300 font-bold">{book.details.format || 'Soft Cover'}</span></p>
                <p><span className="text-zinc-400 dark:text-zinc-600 font-semibold">Harga:</span> <span className="text-zinc-800 dark:text-zinc-300 font-bold">{book.details.price || 'Gratis'}</span></p>
                <p><span className="text-zinc-400 dark:text-zinc-600 font-semibold">Rak Buku:</span> <span className="text-zinc-800 dark:text-zinc-300 font-bold">RAK-{(book.category?.name || 'GEN').substring(0, 3).toUpperCase()}</span></p>
                <p><span className="text-zinc-400 dark:text-zinc-600 font-semibold">Status:</span> <span className={available ? 'text-emerald-600 dark:text-emerald-450 font-black' : 'text-rose-600 dark:text-rose-450 font-black'}>{available ? 'Tersedia' : 'Dipinjam'}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
