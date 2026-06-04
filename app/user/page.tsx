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
  Search, BookOpen, ChevronLeft, ChevronRight, CheckCircle2, BookMarked,
  ArrowRight, Loader2, Sparkles, Play, Info, TrendingUp, Star, X, Heart
} from 'lucide-react';

export default function StudentCatalog() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { books: localBooks, isBookAvailable, borrowBook } = useBooks();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Semua');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [heroIndex, setHeroIndex] = useState(0);

  // API loading states
  const [apiBooks, setApiBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Modal and Toast state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [borrowingId, setBorrowingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(7);

  const categories = [
    'Semua', 'Self-Improvement', 'Drama', 'Literary', 'MetroPop',
    'Mysteries & Thrillers', 'Poetry', 'Science & Nature', 'Picture Books', 'Fiksi'
  ];

  // Fetch books from Bukuacak API
  useEffect(() => {
    const fetchApiBooks = async () => {
      setIsLoading(true);
      setFetchError(false);
      try {
        const genreQuery = category !== 'Semua' ? `&genre=${encodeURIComponent(category)}` : '';
        const keywordQuery = searchTerm ? `&keyword=${encodeURIComponent(searchTerm)}` : '';
        const url = `https://api.bukuacak.shabsolute.tech/api/v1/book?page=${page}${genreQuery}${keywordQuery}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setApiBooks(data.books || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Error fetching API books:', err);
        setFetchError(true);
        setApiBooks([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchApiBooks, 450);
    return () => clearTimeout(timer);
  }, [searchTerm, category, page]);

  const handleSearchChange = (val: string) => { setSearchTerm(val); setPage(1); };
  const handleCategoryChange = (val: string) => { setCategory(val); setPage(1); };

  // Custom (admin-added) books, available only, matching search/category
  const filteredCustomBooks = localBooks.filter(book => {
    if (!book.isCustom) return false;
    if (!isBookAvailable(book._id)) return false;
    const matchSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (book.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = category === 'Semua' || (book.category?.name || '') === category;
    return matchSearch && matchCat;
  });

  // API books filtered to only available ones
  const filteredApiBooks = apiBooks.filter(book => isBookAvailable(book._id));

  const allCatalogBooks = [...filteredCustomBooks, ...filteredApiBooks];

  // Netflix rows selections (only active when not searching)
  const isSearchActive = searchTerm !== '' || category !== 'Semua';

  // Hero recommendations: take first 5 books to cycle
  const heroBooks = allCatalogBooks.slice(0, 5);
  const featuredBook = (heroIndex < heroBooks.length ? heroBooks[heroIndex] : heroBooks[0]) || null;

  // Auto-cycle Featured Book every 5 seconds
  useEffect(() => {
    if (heroBooks.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroBooks.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroBooks.length]);

  // Row Data lists
  const popularBooks = allCatalogBooks.slice(0, 8);
  const fictionDramaBooks = allCatalogBooks.filter(b =>
    b.category?.name === 'Drama' || b.category?.name === 'Fiksi' || b.category?.name === 'Literary'
  ).slice(0, 8);
  const selfImprovementBooks = allCatalogBooks.filter(b =>
    b.category?.name === 'Self-Improvement' || b.category?.name === 'Science & Nature'
  ).slice(0, 8);

  // Handle self-borrow
  const handleBorrow = async (book: Book, durationDays = 7) => {
    if (!user) return;

    setBorrowingId(book._id);
    // Small delay for UX feedback
    await new Promise(r => setTimeout(r, 600));

    const result = await borrowBook(book._id, user.username, durationDays);
    setBorrowingId(null);

    if (result.success) {
      setToast({ message: `✓ Berhasil! "${book.title}" dipinjam selama ${durationDays} hari.`, type: 'success' });
      // Close modal if open
      setSelectedBook(null);
    } else {
      setToast({ message: result.message, type: 'error' });
    }
  }; return (
    <div className="space-y-10 min-h-screen pb-16 bg-zinc-50 dark:bg-[#141414] text-zinc-900 dark:text-zinc-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 transition-colors duration-300">
      {/* Premium Animations & Style Injector */}
      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes kenburns {
          0% { transform: scale(1.03) translate(0, 0); }
          50% { transform: scale(1.08) translate(0.5%, -0.5%); }
          100% { transform: scale(1.03) translate(0, 0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-kenburns {
          animation: kenburns 30s ease-in-out infinite;
        }
        .animate-fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
      `}</style>

      {/* 1. Netflix Hero Billboard */}
      {!isSearchActive && featuredBook && (
        <div key={featuredBook._id} className="relative w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800/80 aspect-[16/9] md:aspect-[21/9] bg-white dark:bg-zinc-950 flex flex-row items-center justify-between shadow-lg dark:shadow-2xl transition-all duration-300">
          {/* Backdrop Cover Image */}
          <div className="absolute inset-0 select-none">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-black dark:via-black/90 dark:to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent dark:from-[#141414] dark:via-transparent dark:to-transparent z-10" />
            <img
              src={featuredBook.cover_image}
              alt={featuredBook.title}
              className="w-full h-full object-cover blur-[8px] opacity-25 dark:opacity-35 scale-105 animate-kenburns"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop';
              }}
            />
          </div>

          {/* Left Column: Featured Content details */}
          <div className="relative z-10 max-w-xl px-6 sm:px-12 py-8 flex flex-col items-start space-y-4">
            <span className="opacity-0 animate-fade-up inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-600/10 px-2.5 py-1 rounded border border-teal-600/20 dark:border-teal-500/25">
              <Sparkles className="h-3 w-3 fill-teal-600 dark:fill-teal-400 animate-pulse" /> REKOMENDASI HARI INI
            </span>
            <h1 className="opacity-0 animate-fade-up delay-100 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-zinc-950 dark:text-white drop-shadow-sm">
              {featuredBook.title}
            </h1>
            <p className="opacity-0 animate-fade-up delay-200 text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 font-bold drop-shadow-sm">
              Karya <span className="text-zinc-800 dark:text-zinc-200">{featuredBook.author?.name}</span> &bull; {featuredBook.category?.name}
            </p>
            <p className="opacity-0 animate-fade-up delay-300 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed drop-shadow-sm max-w-lg font-medium">
              {featuredBook.summary}
            </p>

            {/* Actions */}
            <div className="opacity-0 animate-fade-up delay-400 flex items-center gap-3 pt-2">
              <button
                onClick={() => handleBorrow(featuredBook)}
                disabled={borrowingId === featuredBook._id}
                className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-3 text-xs sm:text-sm shadow-lg shadow-teal-600/20 dark:shadow-teal-950/20 active:scale-[0.98] transition-all disabled:opacity-75 cursor-pointer"
              >
                {borrowingId === featuredBook._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-white" />
                )}
                Pinjam Sekarang
              </button>
              <button
                onClick={() => setSelectedBook(featuredBook)}
                className="flex items-center gap-2 rounded-xl bg-zinc-200/80 hover:bg-zinc-300/80 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-extrabold px-6 py-3 text-xs sm:text-sm transition-all cursor-pointer shadow-sm dark:shadow-none"
              >
                <Info className="h-4 w-4" />
                Info Detail
              </button>
            </div>
          </div>

          {/* Right Column: Floating 3D Cover */}
          <div className="hidden md:flex relative z-10 w-1/3 pr-8 lg:pr-16 justify-end items-center self-stretch py-8">
            <div className="relative group/cover cursor-pointer animate-float">
              {/* Outer Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-teal-600 to-cyan-500 rounded-2xl blur-xl opacity-25 group-hover/cover:opacity-50 transition duration-700 pointer-events-none" />

              {/* Image Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200/20 dark:border-zinc-800/80 shadow-2xl transition-transform duration-500 group-hover/cover:-translate-y-2 group-hover/cover:scale-105 group-hover/cover:rotate-2">
                <img
                  src={featuredBook.cover_image}
                  alt={featuredBook.title}
                  className="w-40 lg:w-48 aspect-[2/3] object-cover"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Netflix Slider Rows */}
      {!isSearchActive && (
        <div className="space-y-8">
          {/* Row 1: Sedang Populer */}
          {popularBooks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Sedang Populer
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
                {popularBooks.map(book => (
                  <div
                    key={book._id}
                    onClick={() => setSelectedBook(book)}
                    className="group flex-shrink-0 w-36 sm:w-44 cursor-pointer relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/85 hover:border-teal-500/40 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg dark:shadow-md dark:shadow-black/40"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    {/* Favorite Button Overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(book._id);
                      }}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-teal-600 transition-all duration-300 active:scale-90 hover:scale-110 shadow-sm"
                      title={isFavorite(book._id) ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 transition-colors ${isFavorite(book._id)
                            ? 'fill-red-600 text-red-600'
                            : 'text-zinc-600 dark:text-zinc-300'
                          }`}
                      />
                    </button>
                    {/* Hover Info Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-black dark:via-black/80 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 space-y-1">
                      <p className="text-[9px] font-extrabold uppercase text-red-600 dark:text-red-500">{book.category?.name}</p>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white line-clamp-2 leading-tight">{book.title}</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">oleh {book.author?.name}</p>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/90 dark:bg-emerald-500/80 px-1.5 py-0.5 text-[8px] font-bold text-white w-max mt-1.5 shadow">
                        ✓ Tersedia
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row 2: Fiksi & Drama Pilihan */}
          {fictionDramaBooks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Fiksi & Drama Terfavorit
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
                {fictionDramaBooks.map(book => (
                  <div
                    key={book._id}
                    onClick={() => setSelectedBook(book)}
                    className="group flex-shrink-0 w-36 sm:w-44 cursor-pointer relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/85 hover:border-teal-500/40 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg dark:shadow-md dark:shadow-black/40"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    {/* Favorite Button Overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(book._id);
                      }}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-teal-600 transition-all duration-300 active:scale-90 hover:scale-110 shadow-sm"
                      title={isFavorite(book._id) ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 transition-colors ${isFavorite(book._id)
                            ? 'fill-red-600 text-red-600'
                            : 'text-zinc-600 dark:text-zinc-300'
                          }`}
                      />
                    </button>
                    {/* Hover Info Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-black dark:via-black/80 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 space-y-1">
                      <p className="text-[9px] font-extrabold uppercase text-red-600 dark:text-red-500">{book.category?.name}</p>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white line-clamp-2 leading-tight">{book.title}</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">oleh {book.author?.name}</p>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/90 dark:bg-emerald-500/80 px-1.5 py-0.5 text-[8px] font-bold text-white w-max mt-1.5 shadow">
                        ✓ Tersedia
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row 3: Self Improvement */}
          {selfImprovementBooks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-teal-600 dark:text-teal-400 fill-teal-600/10 dark:fill-teal-400/20" /> Pengembangan Diri & Sains
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
                {selfImprovementBooks.map(book => (
                  <div
                    key={book._id}
                    onClick={() => setSelectedBook(book)}
                    className="group flex-shrink-0 w-36 sm:w-44 cursor-pointer relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/85 hover:border-teal-500/40 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg dark:shadow-md dark:shadow-black/40"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=387&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    {/* Favorite Button Overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(book._id);
                      }}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-teal-600 transition-all duration-300 active:scale-90 hover:scale-110 shadow-sm"
                      title={isFavorite(book._id) ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 transition-colors ${isFavorite(book._id)
                            ? 'fill-red-600 text-red-600'
                            : 'text-zinc-600 dark:text-zinc-300'
                          }`}
                      />
                    </button>
                    {/* Hover Info Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-black dark:via-black/80 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 space-y-1">
                      <p className="text-[9px] font-extrabold uppercase text-red-600 dark:text-red-500">{book.category?.name}</p>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white line-clamp-2 leading-tight">{book.title}</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">oleh {book.author?.name}</p>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/90 dark:bg-emerald-500/80 px-1.5 py-0.5 text-[8px] font-bold text-white w-max mt-1.5 shadow">
                        ✓ Tersedia
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Search & Grid Catalog Section */}
      <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
            {isSearchActive ? 'Hasil Pencarian Buku' : 'Semua Koleksi Perpustakaan'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
            Gunakan filter kategori atau cari kata kunci untuk menemukan buku tertentu dengan cepat.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500 dark:text-zinc-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Cari judul buku atau nama penulis..."
              className="w-full bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-650 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all shadow-sm"
            />
          </div>
          <select
            value={category}
            onChange={e => handleCategoryChange(e.target.value)}
            className="bg-white dark:bg-[#1e1e1e] border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-teal-500/60 transition-all sm:w-52 shadow-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-350">{cat}</option>
            ))}
          </select>
        </div>

        {/* Main Grid View */}
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
                className="group border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-[#1e1e1e] hover:border-teal-500/30 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/60"
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
                      <span className="absolute top-2 left-2 bg-teal-600/90 backdrop-blur-sm text-[8px] font-bold text-white px-1.5 py-0.5 rounded uppercase">
                        Admin
                      </span>
                    )}
                    {/* Favorite Button Inside Image */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(book._id);
                      }}
                      className="absolute bottom-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-teal-600 transition-all duration-305 active:scale-90 hover:scale-110 shadow-sm"
                      title={isFavorite(book._id) ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                    >
                      <Heart
                        className={`h-3.5 w-3.5 transition-colors ${isFavorite(book._id)
                            ? 'fill-teal-600 text-teal-600'
                            : 'text-zinc-650 dark:text-zinc-300'
                          }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-1 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      {book.category?.name || 'Lainnya'}
                    </span>
                    <h3
                      className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors"
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
                  <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                    Lihat Detail & Pinjam <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl py-24 px-4 text-center">
            <BookOpen className="h-12 w-12 text-zinc-400 dark:text-zinc-700 mb-3" />
            <h3 className="font-bold text-zinc-500 dark:text-zinc-450">
              {fetchError ? 'Gagal memuat katalog' : 'Tidak ada buku tersedia'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-xs leading-relaxed">
              {fetchError
                ? 'Terjadi kegagalan koneksi ke server buku. Silakan coba beberapa saat lagi.'
                : 'Semua buku sedang dipinjam atau tidak ada buku yang cocok dengan pencarian Anda.'}
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
              Halaman <span className="text-zinc-950 dark:text-zinc-200 font-bold">{page}</span> dari {totalPages}
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
                <span className="inline-flex items-center rounded bg-teal-600/10 px-2 py-0.5 text-[9px] font-extrabold tracking-wider uppercase text-teal-600 dark:text-teal-400 border border-teal-500/20">
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

              {/* Duration Selector */}
              <div className="space-y-1.5 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Durasi Peminjaman</label>
                <div className="flex gap-2">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDuration(d)}
                      className={`flex-grow py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${selectedDuration === d
                          ? 'bg-teal-600/10 border-teal-500/35 text-teal-600 dark:text-teal-400'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-555 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                        }`}
                    >
                      {d} Hari
                    </button>
                  ))}
                </div>
              </div>

              {/* Borrow action & Favorite Toggle */}
              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => handleBorrow(selectedBook, selectedDuration)}
                  disabled={borrowingId === selectedBook._id}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 py-3 text-xs font-extrabold text-white shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-wait cursor-pointer"
                >
                  {borrowingId === selectedBook._id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses Peminjaman...
                    </>
                  ) : (
                    <>
                      <BookMarked className="h-4 w-4" />
                      Pinjam Sekarang ({selectedDuration} Hari)
                    </>
                  )}
                </button>
                <button
                  onClick={() => toggleFavorite(selectedBook._id)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${isFavorite(selectedBook._id)
                      ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-500/30 text-teal-600 dark:text-teal-400'
                      : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                    }`}
                  title={isFavorite(selectedBook._id) ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                >
                  <Heart className={`h-5 w-5 ${isFavorite(selectedBook._id) ? 'fill-teal-600 text-teal-600' : ''}`} />
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
