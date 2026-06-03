'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useBooks } from '@/context/BookContext';
import type { Book } from '@/context/BookContext';
import { useFavorites } from '@/context/FavoritesContext';
import Toast from '@/components/Toast';
import { 
  LayoutGrid, Sparkles, Heart, BookOpen, Flame, Feather, Leaf, Smile, Compass,
  ChevronLeft, ChevronRight, Loader2, X, ArrowRight, BookMarked, Play, Info
} from 'lucide-react';

interface GenreInfo {
  name: string;
  gradient: string;
  icon: React.ComponentType<any>;
  description: string;
}

export default function GenresPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { books: localBooks, isBookAvailable, borrowBook } = useBooks();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [category, setCategory] = useState('Semua');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // API loading states
  const [apiBooks, setApiBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Modal and Toast state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowingId, setBorrowingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Define genres with metadata for premium UI
  const genresList: GenreInfo[] = [
    {
      name: 'Semua',
      gradient: 'from-zinc-500 to-zinc-700 dark:from-zinc-700 dark:to-zinc-900',
      icon: LayoutGrid,
      description: 'Semua koleksi buku perpustakaan',
    },
    {
      name: 'Self-Improvement',
      gradient: 'from-violet-500 to-indigo-650 dark:from-violet-650 dark:to-indigo-800',
      icon: Sparkles,
      description: 'Pengembangan diri & motivasi',
    },
    {
      name: 'Drama',
      gradient: 'from-rose-500 to-red-650 dark:from-rose-650 dark:to-red-800',
      icon: Heart,
      description: 'Kisah drama kehidupan & emosional',
    },
    {
      name: 'Literary',
      gradient: 'from-amber-500 to-orange-600 dark:from-amber-650 dark:to-orange-850',
      icon: BookOpen,
      description: 'Karya sastra klasik & bernilai tinggi',
    },
    {
      name: 'MetroPop',
      gradient: 'from-pink-500 to-rose-550 dark:from-pink-650 dark:to-rose-700',
      icon: Flame,
      description: 'Kisah populer perkotaan modern',
    },
    {
      name: 'Mysteries & Thrillers',
      gradient: 'from-slate-700 to-zinc-900 dark:from-slate-800 dark:to-zinc-950',
      icon: Compass, // Placeholder for suspense/mystery
      description: 'Misteri menegangkan & penuh teka-teki',
    },
    {
      name: 'Poetry',
      gradient: 'from-purple-500 to-fuchsia-600 dark:from-purple-650 dark:to-fuchsia-800',
      icon: Feather,
      description: 'Puisi, bait indah, & ungkapan rasa',
    },
    {
      name: 'Science & Nature',
      gradient: 'from-emerald-500 to-teal-650 dark:from-emerald-650 dark:to-teal-800',
      icon: Leaf,
      description: 'Sains, alam semesta, & lingkungan',
    },
    {
      name: 'Picture Books',
      gradient: 'from-sky-400 to-blue-600 dark:from-sky-500 dark:to-blue-750',
      icon: Smile,
      description: 'Buku bergambar penuh ilustrasi kreatif',
    },
    {
      name: 'Fiksi',
      gradient: 'from-red-500 to-orange-600 dark:from-red-650 dark:to-orange-750',
      icon: Compass,
      description: 'Kisah fiksi imajinatif & petualangan',
    },
  ];

  // Fetch books from Bukuacak API based on selected genre
  useEffect(() => {
    const fetchApiBooks = async () => {
      setIsLoading(true);
      setFetchError(false);
      try {
        const genreQuery = category !== 'Semua' ? `&genre=${encodeURIComponent(category)}` : '';
        const url = `https://api.bukuacak.shabsolute.tech/api/v1/book?page=${page}${genreQuery}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setApiBooks(data.books || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Error fetching API books by genre:', err);
        setFetchError(true);
        setApiBooks([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiBooks();
  }, [category, page]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setPage(1);
  };

  // Custom (admin-added) books, available only, matching category
  const filteredCustomBooks = localBooks.filter(book => {
    if (!book.isCustom) return false;
    if (!isBookAvailable(book._id)) return false;
    return category === 'Semua' || (book.category?.name || '') === category;
  });

  // API books filtered to only available ones
  const filteredApiBooks = apiBooks.filter(book => isBookAvailable(book._id));

  const allCatalogBooks = [...filteredCustomBooks, ...filteredApiBooks];

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

  return (
    <div className="space-y-10 min-h-screen pb-16 bg-zinc-50 dark:bg-[#141414] text-zinc-900 dark:text-zinc-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 transition-colors duration-300">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white flex items-center gap-3">
          <LayoutGrid className="h-8 w-8 text-red-600 dark:text-red-500" />
          Jelajahi Berdasarkan Genre
        </h1>
        <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Pilih salah satu kartu genre di bawah ini untuk menyaring koleksi buku perpustakaan dan temukan bacaan yang cocok dengan minat Anda secara instan.
        </p>
      </div>

      {/* 2. Genre Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {genresList.map((genreItem) => {
          const IconComponent = genreItem.icon;
          const isSelected = category === genreItem.name;

          return (
            <button
              key={genreItem.name}
              onClick={() => handleCategoryChange(genreItem.name)}
              className={`group relative overflow-hidden rounded-2xl p-5 text-left border transition-all duration-300 flex flex-col justify-between aspect-[16/11] sm:aspect-[16/10] cursor-pointer ${
                isSelected
                  ? 'border-red-500 dark:border-red-500 ring-2 ring-red-500/20 shadow-md scale-[1.02]'
                  : 'border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 hover:border-zinc-350 dark:hover:border-zinc-700 shadow-sm hover:scale-[1.02]'
              }`}
            >
              {/* Decorative background glow for selected/hover */}
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-15 dark:opacity-25 transition-all duration-500 group-hover:scale-150 bg-gradient-to-br ${genreItem.gradient}`} />

              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white bg-gradient-to-br shadow-md ${genreItem.gradient}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                {isSelected && (
                  <span className="flex h-2.5 w-2.5 rounded-full bg-red-650 dark:bg-red-500 animate-pulse" />
                )}
              </div>

              <div className="space-y-1 relative z-10">
                <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white leading-tight">
                  {genreItem.name}
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-tight">
                  {genreItem.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Catalog Section based on selected Genre */}
      <div className="space-y-6 pt-8 border-t border-zinc-200 dark:border-zinc-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
              Koleksi Genre: <span className="text-red-600 dark:text-red-500">{category}</span>
            </h2>
            <p className="text-xs text-zinc-550 dark:text-zinc-500 mt-1">
              Menampilkan {allCatalogBooks.length} buku yang tersedia untuk dipinjam saat ini.
            </p>
          </div>
        </div>

        {/* Catalog Grid View */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
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
        ) : allCatalogBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {allCatalogBooks.map(book => (
              <div
                key={book._id}
                onClick={() => setSelectedBook(book)}
                className="group border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 hover:bg-zinc-55 dark:hover:bg-[#1e1e1e] hover:border-red-500/30 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/60"
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
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded bg-emerald-500/90 dark:bg-emerald-500/80 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-bold text-white shadow">
                      ✓ Tersedia
                    </span>
                    {book.isCustom && (
                      <span className="absolute top-2 left-2 bg-red-650/90 backdrop-blur-sm text-[8px] font-bold text-white px-1.5 py-0.5 rounded uppercase">
                        Admin
                      </span>
                    )}
                    {/* Favorite Button Inside Image */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(book._id);
                      }}
                      className="absolute bottom-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-600 transition-all duration-300 active:scale-90 hover:scale-110 shadow-sm"
                      title={isFavorite(book._id) ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 transition-colors ${
                          isFavorite(book._id)
                            ? 'fill-red-600 text-red-600'
                            : 'text-zinc-650 dark:text-zinc-300'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-1 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 dark:text-red-500">
                      {book.category?.name || 'Lainnya'}
                    </span>
                    <h3
                      className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors"
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
                  <span className="text-[10px] font-extrabold text-red-655 dark:text-red-500 flex items-center gap-1 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                    Lihat Detail & Pinjam <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl py-24 px-4 text-center">
            <BookOpen className="h-12 w-12 text-zinc-400 dark:text-zinc-700 mb-3" />
            <h3 className="font-bold text-zinc-550 dark:text-zinc-450">
              {fetchError ? 'Gagal memuat katalog' : 'Tidak ada buku tersedia'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-xs leading-relaxed">
              {fetchError
                ? 'Terjadi kegagalan koneksi ke server buku. Silakan coba beberapa saat lagi.'
                : 'Tidak ada buku yang ditemukan untuk genre ini saat ini.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && apiBooks.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800/60">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 px-4 py-2.5 text-xs font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </button>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-550">
              Halaman <span className="text-zinc-955 dark:text-zinc-200 font-bold">{page}</span> dari {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 px-4 py-2.5 text-xs font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              Selanjutnya <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Netflix-style detail modal overlay */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/90 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible transition-colors duration-300">
            {/* Left Column: Big Cover */}
            <div className="relative w-full md:w-5/12 aspect-[3/4] md:aspect-auto md:h-auto bg-zinc-100 dark:bg-zinc-955 flex-shrink-0">
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
                <span className="inline-flex items-center rounded bg-red-600/10 px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase text-red-650 dark:text-red-500 border border-red-550/20">
                  {selectedBook.category?.name || 'Lainnya'}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                  {selectedBook.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 font-bold">
                  Penulis: <span className="text-zinc-800 dark:text-zinc-200">{selectedBook.author?.name}</span>
                </p>
                
                {/* Scrollable Summary */}
                <div className="border-t border-b border-zinc-200 dark:border-zinc-800/80 py-3 my-2">
                  <h4 className="text-xs font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider mb-1.5">Sinopsis Buku</h4>
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
                  disabled={borrowingId === selectedBook._id}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-650 hover:bg-red-750 dark:bg-red-655 dark:hover:bg-red-700 py-3 text-xs font-extrabold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-wait cursor-pointer"
                >
                  {borrowingId === selectedBook._id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses Peminjaman...
                    </>
                  ) : (
                    <>
                      <BookMarked className="h-4 w-4" />
                      Pinjam Sekarang (7 Hari)
                    </>
                  )}
                </button>
                <button
                  onClick={() => toggleFavorite(selectedBook._id)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
                    isFavorite(selectedBook._id)
                      ? 'bg-red-50 dark:bg-red-955/30 border-red-200 dark:border-red-500/30 text-red-650 dark:text-red-500'
                      : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                  }`}
                  title={isFavorite(selectedBook._id) ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                >
                  <Heart className={`h-5 w-5 ${isFavorite(selectedBook._id) ? 'fill-red-600 text-red-600' : ''}`} />
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
