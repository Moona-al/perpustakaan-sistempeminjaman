'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useBooks } from '@/context/BookContext';
import type { Book } from '@/context/BookContext';
import { useFavorites } from '@/context/FavoritesContext';
import Link from 'next/link';
import Toast from '@/components/Toast';
import {
  Heart, BookOpen, Loader2, Sparkles, Info, X, BookMarked,
  ArrowRight, Search, Play, Star, HelpCircle
} from 'lucide-react';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { books: localBooks, isBookAvailable, borrowBook } = useBooks();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const [favBooks, setFavBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Semua');

  // Modal and Toast state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowingId, setBorrowingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const categories = [
    'Semua', 'Self-Improvement', 'Drama', 'Literary', 'MetroPop',
    'Mysteries & Thrillers', 'Poetry', 'Science & Nature', 'Picture Books', 'Fiksi'
  ];

  // Resolve favorite books (local + API)
  useEffect(() => {
    const resolveFavorites = async () => {
      if (favorites.length === 0) {
        setFavBooks([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const resolved = await Promise.all(
          favorites.map(async (bookId) => {
            // 1. Try local books first
            const foundLocal = localBooks.find(b => b._id === bookId);
            if (foundLocal) return foundLocal;

            // 2. Fetch from API
            try {
              const res = await fetch(`https://api.bukuacak.shabsolute.tech/api/v1/book/${bookId}`);
              if (!res.ok) return null;
              return await res.json();
            } catch {
              return null;
            }
          })
        );
        // Filter out nulls
        setFavBooks(resolved.filter((b): b is Book => b !== null));
      } catch (err) {
        console.error('Failed to resolve favorite books:', err);
      } finally {
        setIsLoading(false);
      }
    };

    resolveFavorites();
  }, [favorites, localBooks]);

  // Handle self-borrow
  const handleBorrow = async (book: Book) => {
    if (!user) return;

    setBorrowingId(book._id);
    // Small delay for UX feedback
    await new Promise(r => setTimeout(r, 600));

    const result = await borrowBook(book._id, user.username, 7);
    setBorrowingId(null);

    if (result.success) {
      setToast({ message: `✓ Berhasil! "${book.title}" dipinjam selama 7 hari.`, type: 'success' });
      // Close modal if open
      setSelectedBook(null);
    } else {
      setToast({ message: result.message, type: 'error' });
    }
  };

  // Toggle favorite with toast feedback
  const handleToggleFavorite = (bookId: string, title: string) => {
    const wasFavorite = isFavorite(bookId);
    toggleFavorite(bookId);

    if (wasFavorite) {
      setToast({ message: `✓ "${title}" dihapus dari favorit.`, type: 'info' });
      // Close selected modal if that book was unfavorited
      if (selectedBook?._id === bookId) {
        setSelectedBook(null);
      }
    } else {
      setToast({ message: `✓ "${title}" ditambahkan ke favorit.`, type: 'success' });
    }
  };

  // Filter books by search & category
  const filteredFavBooks = favBooks.filter(book => {
    const matchSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchCat = category === 'Semua' || (book.category?.name || '') === category;

    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-8 min-h-screen pb-16 bg-transparent text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 p-6 sm:p-8 shadow-sm dark:shadow-none transition-all duration-300">
        <div className="absolute top-[-20%] right-[-10%] h-48 w-48 rounded-full bg-rose-500/10 blur-3xl"></div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-450 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">
            <Heart className="h-3 w-3 fill-rose-600 dark:fill-rose-550 text-rose-600 dark:text-rose-550 animate-pulse" /> Koleksi Pribadi
          </span>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            Buku Favorit Saya
          </h1>
          <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-455 max-w-xl font-medium leading-relaxed">
            Daftar kurasi buku-buku pilihan Anda. Simpan buku di sini untuk dipinjam nanti, atau akses cepat detail informasinya kapan saja.
          </p>
        </div>
      </div>

      {/* Controls: Search and filter only if they have at least one favorite book */}
      {favorites.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500 dark:text-zinc-550">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari judul buku favorit atau penulis..."
              className="w-full bg-white dark:bg-[#1e1e1e]/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-850 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all shadow-sm"
            />
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-white dark:bg-[#1e1e1e]/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl py-3 px-4 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-rose-500/60 transition-all sm:w-52 shadow-sm cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-350">{cat}</option>
            ))}
          </select>
        </div>
      )}

      {/* Main Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20 p-3 rounded-xl space-y-3 animate-pulse shadow-sm">
              <div className="w-full aspect-[2/3] bg-zinc-200/80 dark:bg-zinc-800/60 rounded-lg" />
              <div className="space-y-2">
                <div className="h-2 w-1/3 bg-zinc-200/80 dark:bg-zinc-800/60 rounded" />
                <div className="h-3 w-3/4 bg-zinc-200/80 dark:bg-zinc-800/60 rounded" />
                <div className="h-2.5 w-1/2 bg-zinc-200/80 dark:bg-zinc-800/60 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl py-20 px-4 text-center bg-white dark:bg-zinc-900/10 shadow-sm dark:shadow-none transition-colors">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl scale-125 animate-pulse"></div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400">
              <Heart className="h-7 w-7 fill-rose-500/20 dark:fill-rose-400/20 animate-bounce" />
            </div>
          </div>
          <h3 className="font-extrabold text-zinc-800 dark:text-zinc-200 text-lg">Belum Ada Buku Favorit</h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-sm leading-relaxed font-semibold">
            Tampaknya Anda belum menambahkan buku apa pun ke daftar favorit Anda. Jelajahi katalog perpustakaan kami yang luar biasa untuk menemukannya!
          </p>
          <Link
            href="/user"
            className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold px-6 py-3 text-xs sm:text-sm shadow-md shadow-rose-600/25 dark:shadow-none active:scale-[0.98] transition-all cursor-pointer border border-transparent"
          >
            <BookOpen className="h-4 w-4" />
            Jelajahi Katalog Buku
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : filteredFavBooks.length === 0 ? (
        /* No Match Search Empty State */
        <div className="flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl py-20 px-4 text-center">
          <HelpCircle className="h-10 w-10 text-zinc-400 dark:text-zinc-650 mb-3" />
          <h3 className="font-bold text-zinc-650 dark:text-zinc-400">Pencarian Tidak Ditemukan</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
            Tidak ada buku favorit yang cocok dengan kata kunci "{searchTerm}" atau filter kategori "{category}".
          </p>
        </div>
      ) : (
        /* Grid Catalog */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredFavBooks.map(book => {
            const available = isBookAvailable(book._id);
            return (
              <div
                key={book._id}
                onClick={() => setSelectedBook(book)}
                className="group border border-zinc-200 dark:border-zinc-800/85 bg-white dark:bg-[#1c1c1c]/40 hover:bg-zinc-55 dark:hover:bg-[#1e1e1e] hover:border-rose-500/30 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/60"
              >
                <div>
                  <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/50 mb-3">
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop';
                      }}
                    />

                    {/* Availability badge */}
                    <span className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[8px] font-bold text-white shadow backdrop-blur-sm ${available ? 'bg-emerald-500/90 dark:bg-emerald-500/80' : 'bg-rose-500/90 dark:bg-rose-500/80'
                      }`}>
                      {available ? '✓ Tersedia' : '✗ Dipinjam'}
                    </span>

                    {book.isCustom && (
                      <span className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-[8px] font-bold text-white px-1.5 py-0.5 rounded uppercase">
                        Admin
                      </span>
                    )}

                    {/* Favorite Toggle Button inside card */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(book._id, book.title);
                      }}
                      className="absolute bottom-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 text-zinc-550 hover:text-rose-600 transition-all duration-300 active:scale-90 hover:scale-110 shadow-sm"
                      title="Hapus dari Favorit"
                    >
                      <Heart
                        className="h-3.5 w-3.5 fill-rose-600 text-rose-600"
                      />
                    </button>
                  </div>

                  <div className="space-y-1 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-450">
                      {book.category?.name || 'Lainnya'}
                    </span>
                    <h3
                      className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-405 transition-colors"
                      title={book.title}
                    >
                      {book.title}
                    </h3>
                    <p className="text-[11px] text-zinc-555 dark:text-zinc-450 line-clamp-1 font-semibold">
                      oleh <span className="text-zinc-700 dark:text-zinc-300 font-bold">{book.author?.name}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
                  <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-450 flex items-center gap-1 group-hover:text-rose-700 dark:group-hover:text-rose-350 transition-colors">
                    Lihat Detail & Pinjam <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Netflix-style detail modal overlay */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/90 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible transition-colors duration-300">
            {/* Left Column: Big Cover */}
            <div className="relative w-full md:w-5/12 aspect-[3/4] md:aspect-auto md:h-auto bg-zinc-100 dark:bg-zinc-950 flex-shrink-0">
              <img
                src={selectedBook.cover_image}
                alt={selectedBook.title}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white via-transparent to-transparent dark:from-zinc-900 dark:via-transparent dark:to-transparent" />
            </div>

            {/* Right Column: Book Info Details */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-6">
              <button
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 transition-all z-20 focus:outline-none cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-4">
                <span className="inline-flex items-center rounded bg-rose-600/10 px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase text-rose-600 dark:text-rose-455 border border-rose-550/20">
                  {selectedBook.category?.name || 'Lainnya'}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                  {selectedBook.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 font-bold">
                  Penulis: <span className="text-zinc-850 dark:text-zinc-200">{selectedBook.author?.name}</span>
                </p>

                {/* Scrollable Summary */}
                <div className="border-t border-b border-zinc-200 dark:border-zinc-800/80 py-3 my-2">
                  <h4 className="text-xs font-bold uppercase text-rose-600 dark:text-rose-450 tracking-wider mb-1.5">Sinopsis Buku</h4>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-36 overflow-y-auto scrollbar-none pr-1 text-justify font-medium">
                    {selectedBook.summary || 'Tidak ada deskripsi singkat untuk buku ini.'}
                  </p>
                </div>

                {/* Additional metadata specs */}
                {selectedBook.details && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/40">
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 block font-bold">ISBN:</span>
                      <span className="text-zinc-750 dark:text-zinc-300 font-bold truncate block">{selectedBook.details.isbn || '-'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 block font-bold">Halaman:</span>
                      <span className="text-zinc-750 dark:text-zinc-300 font-bold block">{selectedBook.details.total_pages || '-'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 block font-bold">Penerbit:</span>
                      <span className="text-zinc-750 dark:text-zinc-300 font-bold truncate block">{selectedBook.publisher || '-'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 block font-bold">Terbit:</span>
                      <span className="text-zinc-750 dark:text-zinc-300 font-bold block">{selectedBook.details.published_date || '-'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Borrow action & Favorite Toggle */}
              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => handleBorrow(selectedBook)}
                  disabled={borrowingId === selectedBook._id || !isBookAvailable(selectedBook._id)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold text-white shadow-lg active:scale-[0.98] transition-all disabled:cursor-not-allowed cursor-pointer ${!isBookAvailable(selectedBook._id)
                      ? 'bg-zinc-300 dark:bg-zinc-850 text-zinc-500 dark:text-zinc-655 shadow-none hover:bg-zinc-300 dark:hover:bg-zinc-850'
                      : 'bg-rose-650 hover:bg-rose-700 dark:bg-rose-650 dark:hover:bg-rose-750 border border-transparent shadow-rose-650/15'
                    }`}
                >
                  {borrowingId === selectedBook._id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses Peminjaman...
                    </>
                  ) : !isBookAvailable(selectedBook._id) ? (
                    <>
                      <X className="h-4 w-4" />
                      Buku Sedang Dipinjam
                    </>
                  ) : (
                    <>
                      <BookMarked className="h-4 w-4" />
                      Pinjam Sekarang (7 Hari)
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleToggleFavorite(selectedBook._id, selectedBook.title)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-rose-950/30 transition-all duration-300 cursor-pointer"
                  title="Hapus dari Favorit"
                >
                  <Heart className="h-5 w-5 fill-rose-600 text-rose-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast popup */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
