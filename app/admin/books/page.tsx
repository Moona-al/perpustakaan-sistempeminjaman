'use client';

import React, { useState, useEffect } from 'react';
import { useBooks, Book, Transaction } from '@/context/BookContext';
import Toast from '@/components/Toast';
import Link from 'next/link';
import { 
  Search, BookOpen, ChevronLeft, ChevronRight, CheckCircle, 
  Clock, Landmark, Hash, AlertCircle, RefreshCcw, UserMinus, ArrowRight, Loader2
} from 'lucide-react';

export default function KatalogBukuAdmin() {
  const { transactions, returnBook, isBookAvailable } = useBooks();

  // Search & Filter state (filter search)
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Semua');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  // API loading states
  const [apiBooks, setApiBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Quick Action feedback
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const categories = [
    'Semua', 'Self-Improvement', 'Drama', 'Literary', 'MetroPop',
    'Mysteries & Thrillers', 'Poetry', 'Science & Nature', 'Picture Books', 'Fiksi'
  ];

  // Fetch books from Bukuacak API (fetching data dari API bukuacak)
  useEffect(() => {
    const fetchApiBooks = async () => {
      setIsLoading(true);
      setFetchError(false);
      try {
        const genreQuery = category !== 'Semua' ? `&genre=${encodeURIComponent(category)}` : '';
        const keywordQuery = searchTerm ? `&keyword=${encodeURIComponent(searchTerm)}` : '';
        const url = `https://api.bukuacak.shabsolute.tech/api/v1/book?page=${page}${genreQuery}${keywordQuery}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch catalog');
        const data = await res.json();
        setApiBooks(data.books || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalBooks(data.pagination?.totalBooks || 0);
      } catch (err) {
        console.error('Error fetching API books:', err);
        setFetchError(true);
        setApiBooks([]);
        setTotalPages(1);
        setTotalBooks(0);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchApiBooks, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, category, page]);

  const handleSearchChange = (val: string) => { setSearchTerm(val); setPage(1); };
  const handleCategoryChange = (val: string) => { setCategory(val); setPage(1); };

  // Quick Return handler
  const handleQuickReturn = async (txId: string, bookTitle: string) => {
    setProcessingId(txId);
    // Add small delay for nice animation/UX feedback
    await new Promise(r => setTimeout(r, 600));
    const res = await returnBook(txId);
    setProcessingId(null);
    if (res.success) {
      setToast({ message: res.message, type: 'success' });
    } else {
      setToast({ message: res.message, type: 'error' });
    }
  };

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Katalog Buku API
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Lihat ketersediaan buku perpustakaan dari Bukuacak API, serta kelola transaksi peminjaman langsung.
          </p>
        </div>
      </div>

      {/* Filter / Search Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari berdasarkan judul atau penulis buku..."
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900/80 transition-all"
          />
        </div>

        {/* Category dropdown */}
        <div className="w-full sm:w-56">
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 focus:bg-zinc-900/80 transition-all"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-900 text-zinc-300">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Book Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-zinc-800/80 bg-zinc-900/20 p-5 rounded-2xl space-y-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-36 bg-zinc-800/60 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-1/4 bg-zinc-800/60 rounded" />
                  <div className="h-5 w-3/4 bg-zinc-800/60 rounded" />
                  <div className="h-3.5 w-1/2 bg-zinc-800/60 rounded" />
                  <div className="h-8 w-1/3 bg-zinc-800/60 rounded-lg" />
                </div>
              </div>
              <div className="h-10 w-full bg-zinc-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      ) : apiBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {apiBooks.map((book) => {
            const available = isBookAvailable(book._id);
            const activeTx = transactions.find(
              t => t.bookId === book._id && (t.status === 'borrowed' || t.status === 'late')
            );
            const isProcessing = processingId === activeTx?.id;

            return (
              <div
                key={book._id}
                className="border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group hover:shadow-xl hover:shadow-zinc-950/20"
              >
                <div className="flex gap-4">
                  {/* Cover */}
                  <div className="relative w-24 h-36 rounded-xl overflow-hidden bg-zinc-950 shadow-md border border-zinc-800/50 shrink-0">
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop';
                      }}
                    />
                    {/* Status Badge */}
                    <span className={`absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[8px] font-bold text-white shadow ${
                      available ? 'bg-emerald-500/90' : 'bg-amber-500/90'
                    }`}>
                      {available ? 'Tersedia' : 'Dipinjam'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-between min-w-0 flex-1">
                    <div>
                      <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-md px-2 py-0.5 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">
                        {book.category?.name || 'Lainnya'}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-100 truncate mb-1 group-hover:text-indigo-400 transition-colors" title={book.title}>
                        {book.title}
                      </h3>
                      <p className="text-xs text-zinc-400 truncate mb-2">
                        oleh {book.author?.name}
                      </p>
                    </div>
                    
                    <div className="space-y-0.5 text-[10px] text-zinc-500">
                      <p className="truncate"><Landmark className="inline h-3 w-3 mr-1" /> {book.publisher || 'Gramedia'}</p>
                      <p className="truncate"><Hash className="inline h-3 w-3 mr-1" /> {book.details?.isbn || '-'}</p>
                      <p className="font-semibold text-zinc-300 mt-1 text-xs">{book.details?.price || 'Gratis'}</p>
                    </div>
                  </div>
                </div>

                {/* Status Box & Actions */}
                <div className="border-t border-zinc-800/80 pt-4 mt-5 space-y-3">
                  {!available && activeTx && (
                    <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <p className="text-zinc-500 text-[10px]">Dipinjam Oleh:</p>
                        <p className="font-bold text-indigo-400 truncate mt-0.5">{activeTx.studentName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-zinc-500 text-[10px] flex items-center justify-end gap-0.5">
                          <Clock className="h-2.5 w-2.5" /> Batas Kembali:
                        </p>
                        <p className={`font-semibold mt-0.5 ${
                          activeTx.status === 'late' ? 'text-rose-400' : 'text-zinc-300'
                        }`}>
                          {formatDate(activeTx.dueDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[9px] text-zinc-600 font-mono">ID: {book._id.substring(0, 8)}...</span>
                    
                    <div className="flex gap-2">
                      {available ? (
                        <Link
                          href={`/admin/transactions?tab=new&bookId=${book._id}`}
                          className="flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-lg font-semibold shadow hover:shadow-indigo-500/10 transition-all active:scale-[0.97]"
                        >
                          Pinjamkan Manual
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : activeTx ? (
                        <button
                          onClick={() => handleQuickReturn(activeTx.id, book.title)}
                          disabled={isProcessing}
                          className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              <RefreshCcw className="h-3 w-3" />
                              Proses Pengembalian
                            </>
                          )}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-3xl py-20 px-4 text-center">
          <BookOpen className="h-12 w-12 text-zinc-600 mb-3" />
          <h3 className="font-bold text-zinc-400">
            {fetchError ? 'Gagal memuat katalog' : 'Katalog buku kosong'}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs">
            {fetchError
              ? 'Ada kendala dalam menghubungkan ke Bukuacak API. Silakan coba kembali beberapa saat lagi.'
              : 'Tidak ditemukan buku yang sesuai dengan kriteria pencarian Anda.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && apiBooks.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-800/60">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-900/60 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" /> Sebelumnya
          </button>
          <span className="text-xs font-medium text-zinc-500">
            Halaman <span className="text-zinc-300 font-bold">{page}</span> dari {totalPages}
            <span className="text-zinc-600 font-normal"> ({totalBooks} total buku)</span>
          </span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-900/60 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            Selanjutnya <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

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
